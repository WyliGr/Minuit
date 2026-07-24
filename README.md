# Minuit

Cinema schedule aggregator. Fetches showtimes from Allocine,
centralizes them through a cache-first backend, and renders a single dark UI.

Monorepo: `backend/` (AdonisJS API + SQLite) and `frontend/` (Astro + React).
A reference for the original n8n logic lives at `n8n-workflow.json` in the repo
root.

## Quick start (Docker)

```sh
docker compose up --build
```

- **Backend API** → `http://localhost:3333`
- **Frontend** → `http://localhost:4321`
- **Swagger UI** → `http://localhost:8088`

SQLite data (theaters + cached schedules) persists in the `minuit-db` named
volume across restarts.

## Repository layout

```
Minuit/
├── backend/          AdonisJS v7 API (TypeScript, Lucid, VineJS, SQLite)
├── frontend/         Astro + React 19 single-page viewer
├── docker-compose.yml  orchestrates backend + frontend + swagger-ui
├── n8n-workflow.json    reference for the original scraping logic
└── AGENTS.md           agent instructions (read this before editing)
```

---

# Backend

AdonisJS v7 REST API that scrapes Allocine showtimes, caches them in SQLite,
and serves them through a clean JSON interface. No auth, no sessions — public
read-only.

## Stack

- **AdonisJS v7** (TypeScript) — HTTP framework, not v6 (see `AGENTS.md`)
- **Lucid ORM** + **better-sqlite3** — models, migrations, query builder
- **VineJS v4** — validates both the query params and the Allocine payload
- **Docker** — multi-stage build, SQLite volume mount for persistence

## Dev commands (run from `backend/`)

```sh
npm run dev          # dev server with HMR (node ace serve --hmr)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run format       # prettier --write . (auto-fixes most lint errors)
npm run build        # node ace build -> outputs to build/
```

Verification order before declaring a task done:
`format` → `lint` → `typecheck` → `build`.

## Database setup (first time)

```sh
cd backend
node ace migration:run     # create theaters + schedules tables
node ace db:seed            # seed the 5 Strasbourg theaters (idempotent)
```

## API reference

Base URL: `http://localhost:3333` (dev and Docker).

### `GET /` — Health check

Returns `{ name: "minuit", status: "ok" }`. No params.

### `GET /api/v1/theaters` — List active theaters

Returns the theater list instantly (reads DB, does NOT call Allocine). Use for
filter bars / first paint before schedules resolve.

**No params.**

```json
{
  "theaters": [
    { "slug": "ugc-cine-cite", "name": "UGC Ciné Cité", "isActive": true },
    { "slug": "le-cosmos", "name": "Le Cosmos", "isActive": true }
  ]
}
```

### `GET /api/v1/theater` — Get schedules

**Query param:**

| name | type | required | default | description |
|------|------|----------|---------|-------------|
| `days` | integer OR range string | no | `0` | Single offset (`0`=today, `1`=tomorrow, ... up to `30`) OR inclusive range string (`"0-6"` for today through 6 days from now). Range bounds must be 0-30 with FROM <= TO. |

**Response shape depends on input:**

- **Single day** (`days=N` or omitted): flat `SchedulesResponse` object.
- **Range** (`days=FROM-TO`): `{ days: [SchedulesResponse, ...] }` — one entry
  per offset, ascending.

**Single-day success — `200`**

```json
{
  "date": "2026-07-24",
  "dayOffset": 0,
  "displayDate": "vendredi 24 juillet",
  "generatedAt": "2026-07-24T14:03:11.000Z",
  "theaters": [
    {
      "slug": "ugc-cine-cite",
      "name": "UGC Ciné Cité",
      "lastFetchedAt": "2026-07-24T14:03:11.000Z",
      "films": [
        {
          "title": "DUNE PART TWO",
          "runtime": 166,
          "posterUrl": "/api/v1/poster?url=https%3A%2F%2Ffr.web.img6.acsta.net%2Fimg%2Fc5%2F3a%2Fc53a1a379f5efd5c58ae238e530e6927.jpg",
          "showtimes": [
            {
              "time": "14:30",
              "startsAt": "2026-07-24T14:30:00",
              "isVost": false,
              "isPreview": false
            }
          ]
        }
      ]
    }
  ]
}
```

**Range success — `200`**

```json
{
  "days": [
    { "date": "...", "dayOffset": 0, "displayDate": "...", "generatedAt": "...", "theaters": [...] },
    { "date": "...", "dayOffset": 1, "displayDate": "...", "generatedAt": "...", "theaters": [...] }
  ]
}
```

**Validation error — `422`** (VineJS)

```json
{
  "errors": [
    { "message": "The days field must be a number (0-30) or a range like \"0-6\"", "rule": "days.format", "field": "days" }
  ]
}
```

Error rules: `days.format` (unrecognized format), `days.range` (out of bounds or
FROM > TO).

### `GET /api/v1/poster?url=<encoded>` — Proxy poster image

Streams a poster image from Allocine's CDN through the backend (same-origin,
bypasses CORS/hotlink blocks). The `posterUrl` field in schedule responses is
already rewritten to this proxy URL — use it directly as `<img src={posterUrl}>`.

**Query param:**

| name | type | required | description |
|------|------|----------|-------------|
| `url` | string (URL) | yes | Full Allocine CDN URL. Must be `https://` and on an `*.acsta.net` host. |

**Success — `200`** — raw image bytes with `Content-Type: image/jpeg` and
`Cache-Control: public, max-age=2592000, immutable` (30 days).

**Validation error — `422`** — URL missing, not https, or not on an allowed host.

### Response schema

```
TheatersResponse
└── theaters[]    TheaterListItem
    ├── slug      string
    ├── name      string
    └── isActive  boolean

SchedulesResponse (single day — flat)
├── date          string   YYYY-MM-DD (target day)
├── dayOffset     integer  the requested offset
├── displayDate   string   French human-readable ("vendredi 24 juillet")
├── generatedAt   string   ISO 8601 (when this response was assembled)
└── theaters[]    TheaterSlice (ordered by theater ID, active only)
    ├── slug          string   URL-safe key ("ugc-cine-cite")
    ├── name          string   display name ("UGC Ciné Cité")
    ├── lastFetchedAt string   ISO 8601 — when Allocine was last fetched
    └── films[]       Film
        ├── title     string   uppercased, quotes stripped
        ├── runtime   integer  minutes (parsed from "3h 07min")
        ├── posterUrl string|null  proxy URL (/api/v1/poster?url=...) — use as <img src>
        └── showtimes[] Showtime (sorted by startsAt ascending)
            ├── time      string   "HH:MM" (fr-FR, 24h)
            ├── startsAt  string   ISO 8601 timestamp
            ├── isVost    boolean  true if original version
            └── isPreview boolean  true if avant-première

SchedulesRangeResponse (multi-day — wrapped)
└── days[]    SchedulesResponse (same shape as single-day, one per offset)
```

### Behavior notes

- **`generatedAt` vs `lastFetchedAt`:** `generatedAt` is when the response was
  assembled (always ~now). `lastFetchedAt` (per theater) is when Allocine was
  actually fetched — use it for "data from 2h ago" freshness indicators.
- **Today filtering:** when `days=0` (or range starts at 0), showtimes that
  started before the request moment are filtered out. Future days include all
  showtimes.
- **Empty films array:** a theater with no showtimes for the target date
  returns `films: []`. The theater still appears (it's active).
- **Theater list is dynamic:** controlled by the `theaters` DB table
  (`is_active` flag). Adding/removing/toggling a theater changes the response
  without code changes.
- **Caching:** first request for a theater+date fetches from Allocine (~200ms).
  Subsequent requests within `CACHE_TTL_MINUTES` (default 360 = 6h) return
  cached data (~10ms). Range requests cache each day independently.

### Known theater slugs

| slug | name | allocine_id |
|------|------|-------------|
| `ugc-cine-cite` | UGC Ciné Cité | P0963 |
| `le-cosmos` | Le Cosmos | P0026 |
| `vox` | Vox | P0600 |
| `star` | Star | P0027 |
| `star-st-exupery` | Star St-Exupéry | P0025 |

### Error scenarios

| status | cause | body |
|--------|--------|------|
| `200` | success | `SchedulesResponse` / `SchedulesRangeResponse` / `TheatersResponse` |
| `404` | unknown path | AdonisJS default error |
| `422` | invalid `days` param or invalid poster `url` | `ValidationError` |
| `500` | Allocine fetch failure (upstream down) | AdonisJS default error |

### Example requests

```sh
# Theater list (instant, no Allocine)
curl http://localhost:3333/api/v1/theaters

# Today (default)
curl http://localhost:3333/api/v1/theater

# Tomorrow
curl http://localhost:3333/api/v1/theater?days=1

# 7-day range (today + next 6 days)
curl http://localhost:3333/api/v1/theater?days=0-6

# Poster proxy (streams image bytes)
curl "http://localhost:3333/api/v1/poster?url=https%3A%2F%2Ffr.web.img6.acsta.net%2Fimg%2Fc5%2F3a%2Fc53a1a379f5efd5c58ae238e530e6927.jpg" -o poster.jpg

# Invalid — returns 422
curl http://localhost:3333/api/v1/theater?days=abc
```

## Architecture (cache-first)

```
Client → GET /api/v1/theater?days=N
       → SchedulesController
       → ScheduleService
           1. Load active theaters from `theaters` table (ordered by id)
           2. For each theater, check `schedules` row for (theater_id, date)
           3. Cache hit  → return stored payload (last_fetched_at within TTL)
           4. Cache miss → AllocineService.fetchSchedule()
              → fetch allocine.fr/_/showtimes/theater-{id}/d-{YYYY-MM-DD}
              → VineJS clean + normalize (title, runtime, showtimes, poster)
              → upsert `schedules` row with last_fetched_at = now
              → rewrite posterUrl to /api/v1/poster?url=... proxy
              → return
```

Per-theater `payload` JSON column stores `{ films: [...] }`. Cross-theater
merge happens at read time, not in storage. Poster URLs are rewritten to the
proxy at response time (the DB keeps the original Allocine URL).

## Configuration

Environment variables (see `backend/.env.example`):

| var | default | description |
|-----|---------|-------------|
| `PORT` | `3333` | HTTP server port |
| `HOST` | `0.0.0.0` | HTTP server bind address |
| `DB_PATH` | `database/minuit.sqlite` | SQLite file path (relative to `backend/`) |
| `CACHE_TTL_MINUTES` | `360` | Cache lifetime (360 = 6 hours) |
| `CORS_ORIGIN` | `http://localhost:5173,...` | Comma-separated allowed origins |
| `APP_KEY` | — | AdonisJS app key (generate with `node ace generate:key`) |

## Adding or removing theaters

Edit the `theaters` table directly — no code changes needed:

```sh
cd backend
node ace repl
> const Theater = (await import('#models/theater')).default
> await Theater.create({ allocineId: 'P1138', name: 'New Cinema', slug: 'new-cinema', isActive: true })
> await Theater.query().where('slug', 'vox').update({ isActive: false })
```

Columns: `allocine_id`, `name`, `slug`, `is_active`. The `slug` is the response
key. `ScheduleService` queries `is_active = true` at request time.

## Docker

`backend/Dockerfile` is multi-stage:

- **base** — `node:22-slim`, `npm ci` (full deps for build), `npm run build`,
  `npm prune --omit=dev`
- **runtime** — copies `build/` + `node_modules` + `database/`, runs
  `node build/ace.js migration:run --force && node build/ace.js db:seed &&
  node build/bin/server.js` on every container start

`docker-compose.yml` at the repo root:

- Mounts named volume `minuit-db` to `/app/database` (SQLite persists)
- `.env` is NOT copied — env vars come from the `environment:` block
- Swagger UI served on `:8088` from `backend/openapi.yaml`

## OpenAPI / Swagger

The OpenAPI 3.1 spec lives at `backend/openapi.yaml`. When running Docker, view
it at `http://localhost:8088`. To preview locally:

```sh
docker run -p 8088:8080 -e SWAGGER_JSON=/spec/openapi.yaml \
  -v $(pwd)/backend/openapi.yaml:/spec/openapi.yaml:ro swaggerapi/swagger-ui
```

---

# Frontend

Astro + React 19 cinema schedule viewer. Reads from the AdonisJS backend at
`/api/v1/...`, renders a single dark UI with no client-side router.

## Stack

- **Astro 7** — static site generator, single page (`src/pages/index.astro`)
- **React 19** — one island (`Dashboard`) mounted `client:only="react"`. The whole
  schedule UI lives in this island.
- **Geist Variable + Geist Mono Variable** — self-hosted via `@fontsource-variable/*`.
  No Google Fonts, no FOUT.
- **Hand-written CSS** — design tokens in `src/styles/tokens.css`, component CSS
  in `src/styles/global.css`. No Tailwind, no CSS-in-JS, no preprocessor.
- **Lucide React** — the only icon library. 1.5px stroke, 14–20px.
- **Astro ClientRouter** — view transitions enabled for future multi-page work.

## File layout

```
frontend/
├── astro.config.mjs          # Vite proxy to backend in dev, no SSR
├── public/favicon.svg        # inline SVG, no PNG fallback
├── nginx.conf                # production: serve dist/, proxy /api/ to backend
├── Dockerfile                # multi-stage: node:22-slim build → nginx:alpine
├── src/
│   ├── pages/
│   │   └── index.astro       # mounts <Dashboard client:only="react" />
│   ├── layouts/
│   │   └── base.astro        # <html>, fonts, skip link, ClientRouter
│   ├── styles/
│   │   ├── tokens.css        # design tokens (color, type, spacing, motion, bg)
│   │   └── global.css        # all component CSS, organized by section
│   ├── lib/                  # PURE — no React, no JSX
│   │   ├── types.ts          # API response types
│   │   ├── api.ts            # fetch helpers, ApiError class
│   │   ├── schedule.ts       # groupByMovie, groupByTime, formatRuntime, isPast
│   │   └── use-schedule.ts   # React hook: theaters + per-day cache
│   └── components/           # all React
│       ├── dashboard.tsx              # entry, mounts <DashboardContent />
│       ├── dashboard-content.tsx      # orchestrator: Nav → Hero → Controls → Views → Footer
│       ├── nav.tsx                    # sticky top bar
│       ├── hero.tsx                   # display date + stats / meta line
│       ├── controls.tsx               # sticky island: day strip + filters + view toggle
│       ├── day-strip.tsx              # horizontal day chips
│       ├── filter-bar.tsx             # theater text toggles
│       ├── view-toggle.tsx            # segmented control with sliding indicator
│       ├── by-movie-view.tsx          # film sections, hairline-divided venues
│       ├── by-time-view.tsx           # hour buckets, tabular rows
│       ├── poster.tsx                 # 2:3 thumbnail, lazy-load, monogram fallback
│       ├── skeletons.tsx              # shape-matched loading state
│       ├── state-views.tsx            # empty + error
│       ├── cursor.tsx                 # 14px accent dot, 56px ring on hover
│       └── use-scroll-reveal.ts       # IntersectionObserver hook
└── tsconfig.json
```

## Commands

```sh
npm run dev       # astro dev on :4321, Vite proxies /api → http://localhost:3333
npm run check     # astro check (ts + a11y)
npm run build     # astro build → dist/ (static)
npm run preview   # astro preview the built dist/
```

Run from `frontend/`, not the repo root.

## Design system

| Token group | File | What it controls |
|---|---|---|
| Color | `tokens.css` | `--color-bg`, `--color-surface*`, `--color-text*`, `--color-accent*` (one blue) |
| Type | `tokens.css` | Geist + Geist Mono, modular scale 1.25, body 16px |
| Spacing | `tokens.css` | 8pt grid: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 |
| Radius | `tokens.css` | 2 / 4 / 6 / 8 / pill. All small. |
| Motion | `tokens.css` | Two easing curves, three durations. All collapse under `prefers-reduced-motion`. |
| Background | `tokens.css` | Two fixed layers: hairline grid + noise field, both pointer-events-none |

**One accent color.** `#3632ba` (deep blue). Every accent surface (selected day,
view-toggle indicator, showtime hover, freshness dot, focus ring, error retry)
reads from `var(--color-accent)`. Change one value, change the whole app.

## Backend contract

See the **Backend** section above for the full API reference. Summary: no auth,
no CORS issues (Vite proxy in dev, nginx proxy in prod).

```
GET /api/v1/theaters              → { theaters: [{ slug, name, isActive }] }
GET /api/v1/theater?days=N        → single-day response
GET /api/v1/theater?days=FROM-TO  → { days: [response, ...] }
GET /api/v1/poster?url=<encoded>  → streams poster image bytes (CORS bypass)
```

The `posterUrl` field comes back as a relative proxy path
(`/api/v1/poster?url=...`) so the browser hits the same origin. Use it
directly as `<img src={posterUrl}>`.

## Responsive behavior

Same JSX, two layouts via CSS. The same `Dashboard` component renders on
phone and desktop. The mobile CSS (≤640px) is in section 13 of `global.css`.

- **≤1024px** — hero grid collapses to single column
- **≤768px** — by-movie venue grid stacks, by-time row goes 2-col, view toggle
  becomes icon-only
- **≤640px** — hero becomes editorial: eyebrow + date + right-aligned meta
  line. Stat grid hidden (replaced by meta line). Container padding bumps to
  24px. Nav drops the freshness dot.
- **≤480px** — day chips shrink to 44px min, footer heart stays in line

Page scrollbar hidden on touch devices (`@media (pointer: coarse)`).

## Cursor accent

A 14px accent dot follows the OS cursor with an 8%-per-frame lerp, growing
to a 56px ring on interactive elements. The dot stretches along the velocity
vector when moving fast. Disabled on touch and under reduced motion.

`src/components/cursor.tsx` uses `requestAnimationFrame` + direct DOM
mutation (`dot.style.transform = ...`) — no React state, no re-renders.

## Background treatment

Two fixed, pointer-events-none layers on `body`:
1. **Noise field** — SVG `feTurbulence` at 0.85 frequency, 2.5% opacity, blended `screen`
2. **Hairline grid** — 1px lines on a 48px grid, masked to fade out below the fold

Both are static, no animation, no scroll repaints.

## Production

The frontend container (`frontend/Dockerfile`) is a two-stage build:
- **build stage** — `node:22-slim`, runs `npm run build`, outputs `dist/`
- **runtime stage** — `nginx:alpine`, copies `dist/`, serves on :4321

`nginx.conf` does three things:
- Serves `dist/` as static files
- Proxies `/api/*` to the backend container (no CORS)
- Caches `/_astro/*` (hashed assets) for 1 year, immutable
- Caches `/` (the HTML) with `no-cache, must-revalidate` so future deploys
  don't get stuck behind stale HTML
