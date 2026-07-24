# AGENTS.md

Project-specific guidance for AI coding agents.

## Stack

- Astro 7 + React 19 islands (the dashboard is a single `client:only="react"` island).
- Fonts via `@fontsource-variable/*` (Geist, Geist Mono, Cormorant Garamond). Self-hosted, no Google Fonts `<link>`.
- No CSS framework. All styling is bespoke CSS in `src/styles/global.css`, driven by CSS custom properties defined in `src/layouts/base.astro`.
- No component library. Every element is hand-built with semantic HTML + tokens.

## Design language — "Midnight Brass"

Warm-ink dark mode with a single antique-brass accent. Cormorant Garamond (serif) for display / film titles, Geist (grotesk) for UI, Geist Mono for times / stats / labels. Motivated motion only (scroll-reveal, hover lift, one freshness pulse). Reduced-motion collapses everything to static.

## Dev commands

```sh
npm run dev       # astro dev on :4321, proxies /api -> :3333
npm run build     # astro build -> dist/
npm run check     # astro check (ts + a11y hints)
```

Verification order: `check` -> `build`. Run both before declaring a task done.

## Architecture

- `src/pages/index.astro` mounts `Dashboard` (`client:only="react"`).
- `Dashboard` -> `DashboardContent` (the app shell: editorial hero band + sticky control island + content).
- State + data fetching lives in `src/lib/use-schedule.ts` (theaters list + per-day schedule cache). View layer is pure.
- Schedule transforms (group-by-movie, group-by-time, formatting) in `src/lib/schedule.ts` are pure and tested-by-use.
- API client in `src/lib/api.ts` proxies to the Adonis backend via Astro's Vite proxy in dev; set `PUBLIC_API_BASE` for prod.

## Backend contract

See `docs/API.md`. Two endpoints: `GET /api/v1/theaters` (instant list) and `GET /api/v1/theater?days=N` or `?days=FROM-TO` (cached schedules). No auth.