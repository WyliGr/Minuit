# AGENTS.md

Repo is a cinema schedule aggregator. Backend lives in `backend/`; frontend will be added later (planned monorepo). Reference for the original logic: `n8n-workflow.json` at repo root.

## Working directory

- All backend commands run from `backend/`, not the repo root.
- `docker compose up --build` runs from the **repo root** (compose file is there, not in `backend/`).

## Dev commands (run in `backend/`)

```sh
npm run dev          # dev server with HMR (node ace serve --hmr)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run format       # prettier --write . (auto-fixes most lint errors)
npm run build        # node ace build -> outputs to build/
```

Verification order: `format` -> `lint` -> `typecheck` -> `build`. Run all four before declaring a task done.

## Ace commands (AdonisJS CLI)

- `node ace make:migration <name>` — NOT `migration:make` (the scaffolded kit uses `make:*` namespacing).
- `node ace make:model`, `make:seeder`, `make:controller`, `make:service` — same pattern.
- `node ace migration:run` — apply migrations.
- `node ace db:seed` — run seeders (idempotent via `firstOrCreate`).
- `node ace repl` — inspect DB / models live. `node ace serve` boots the app before commands run, so broken `start/routes.ts` blocks ALL ace commands.

## Critical gotchas

- **AdonisJS v7, not v6.** `npm create adonisjs@latest` installs v7 (the `latest` dist-tag). The `api` starter kit is v7-only. The user's original spec said v6; the project deliberately moved to v7.
- **Auth/Tuyau/session/shield were stripped** from the `api` scaffold. This is a public read-only API. Do not re-add `@adonisjs/auth`, `@adonisjs/session`, `@adonisjs/shield`, or `@tuyau/core` without explicit approval.
- **`database/schema.ts` is auto-generated** by Lucid's codegen during `migration:run`. Do not hand-edit. It gets regenerated.
- **`DB_PATH` env var** (not a hardcoded path) drives the SQLite filename — see `config/database.ts`. In Docker it's `/app/database/minuit.sqlite`; locally it's `database/minuit.sqlite` (relative to `backend/`).
- **Dev server port conflicts:** if `PORT=3333` is already in use, `ace serve` silently binds to a random port. Check the startup banner for the actual `Server address:` line before curling. Stale `node-MainThread` processes (named differently from `ace serve`) can hold the port after kills — use `ss -tlnp | grep :3333` and `kill -9 <pid>` directly.
- **Allocine `runtime` is a formatted string** like `"3h 07min"`, not a number. `parseRuntime()` in `allocine_service.ts` converts to minutes. The VineJS validator types it as `vine.string()`.
- **VineJS `vine.record()` takes ONE arg** (value schema), not `(key, value)`. Keys are always strings.
- **`import type` for model classes** used only in type positions. ESLint enforces `@typescript-eslint/consistent-type-imports` — `AllocineService` uses `import type Theater` because it never instantiates `Theater`. `ScheduleService` uses `import Theater` (value) because it calls `Theater.query()`.
- **`Number.parseInt`, not `parseInt`** — ESLint rule `@unicorn/prefer-number-properties` is on.

## Architecture (cache-first)

Flow: `GET /api/v1/theater?days=N` -> `SchedulesController` -> `ScheduleService`:

1. Load active theaters from `theaters` table (ordered by `id`).
2. For each theater, check `schedules` row for `(theater_id, date)`.
3. **Cache hit** if `last_fetched_at` within `CACHE_TTL_MINUTES` (default 360 = 6h) -> return stored `payload`.
4. **Cache miss/stale** -> `AllocineService.fetchSchedule()` -> fetch `https://www.allocine.fr/_/showtimes/theater-{allocine_id}/d-{YYYY-MM-DD}` -> VineJS-clean -> upsert `schedules` row -> return.

Per-theater `payload` JSON column stores `{ films: [{ title, runtime, showtimes: [...] }] }`. Cross-theater merge happens at read time, not in storage.

## Adding/removing theaters

Edit the `theaters` table directly (via `node ace repl`, a migration, or SQL). Columns: `allocine_id`, `name`, `slug`, `is_active`. The `slug` is the response key. No code changes needed — `ScheduleService` queries `is_active = true` at request time. Seeder (`database/seeders/theater_seeder.ts`) only seeds the 5 initial Strasbourg theaters via `firstOrCreate`.

## Docker

- `backend/Dockerfile` is multi-stage. Runtime image copies only `build/` + `node_modules` + `package.json` + `database/`. CMD runs `node build/ace.js migration:run --force && node build/ace.js db:seed && node build/bin/server.js` on every container start.
- Use `node build/ace.js` (compiled) in Docker, NOT `node ace.js` — the dev `ace.js` imports `@poppinss/ts-exec` (a devDependency pruned in production).
- Build flag `--ignore-ts-errors` is required because `.dockerignore` excludes `tests/`, so `bin/test.ts` can't resolve `../tests/bootstrap.js` during the build's type-check.
- Base stage must NOT set `ENV NODE_ENV=production` before `npm ci` — it makes npm skip dev deps (`@poppinss/ts-exec`, `@adonisjs/assembler`, `typescript`) needed for `npm run build`.
- `docker-compose.yml` at repo root mounts named volume `minuit-db` to `/app/database` so the SQLite file (and theater list) persists across restarts.
- `.env` is NOT copied into the Docker image — env vars come from `docker-compose.yml`'s `environment:` block.

## Response shape

`GET /api/v1/theater?days=N` returns `{ date, dayOffset, displayDate, generatedAt, theaters: [{ slug, name, films: [{ title, runtime, showtimes: [{ time, startsAt, isVost, isPreview }] }] }] }`. This is a redesign of the original n8n shape (which merged by movie title across theaters) — approved by the user.