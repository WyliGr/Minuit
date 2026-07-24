# Minuit API — Agent Reference

Cinema schedule aggregator. Two public endpoints, no auth, cache-first (6h SQLite cache).

## Base URL

- Local dev: `http://localhost:3333`
- Docker: `http://localhost:3333` (compose maps port 3333)

## Endpoints

### `GET /` — Health check

No params. Returns `{ name: "minuit", status: "ok" }`.

### `GET /api/v1/theaters` — List active theaters

Returns the theater list instantly (reads DB, does NOT call Allocine). Use for filter bars / first paint before schedules resolve.

**No params.**

**Success — `200`**

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
- **Range** (`days=FROM-TO`): `{ days: [SchedulesResponse, ...] }` — one entry per offset, ascending.

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

Error rules: `days.format` (unrecognized format), `days.range` (out of bounds or FROM > TO).

## Response schema

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
    ├── lastFetchedAt string   ISO 8601 — when Allocine was last fetched (data freshness)
    └── films[]       Film
        ├── title     string   uppercased, quotes stripped
        ├── runtime   integer  minutes (parsed from "3h 07min")
        └── showtimes[] Showtime (sorted by startsAt ascending)
            ├── time      string   "HH:MM" (fr-FR, 24h)
            ├── startsAt  string   ISO 8601 timestamp
            ├── isVost    boolean  true if original version
            └── isPreview boolean  true if avant-première

SchedulesRangeResponse (multi-day — wrapped)
└── days[]    SchedulesResponse (same shape as single-day, one per offset)
```

## Behavior notes

- **`generatedAt` vs `lastFetchedAt`:** `generatedAt` is when the response was assembled (always ~now). `lastFetchedAt` (per theater) is when Allocine was actually fetched — use it for "data from 2h ago" freshness indicators.
- **Today filtering:** when `days=0` (or range starts at 0), showtimes that started before the request moment are filtered out. Future days include all showtimes.
- **Empty films array:** a theater with no showtimes for the target date returns `films: []`. The theater still appears in the response (it's active).
- **Theater list is dynamic:** controlled by the `theaters` DB table (`is_active` flag). Adding/removing/toggling a theater changes the response without code changes.
- **Caching:** first request for a theater+date fetches from Allocine (~200ms). Subsequent requests within `CACHE_TTL_MINUTES` (default 360 = 6h) return cached data (~10ms). Range requests cache each day independently.
- **No auth, no CORS restrictions in dev.** CORS origin is configurable via `CORS_ORIGIN` env var.

## Known theater slugs

| slug | name | allocine_id |
|------|------|-------------|
| `ugc-cine-cite` | UGC Ciné Cité | P0963 |
| `le-cosmos` | Le Cosmos | P0026 |
| `vox` | Vox | P0600 |
| `star` | Star | P0027 |
| `star-st-exupery` | Star St-Exupéry | P0025 |

## Error scenarios

| status | cause | body |
|--------|--------|------|
| `200` | success | `SchedulesResponse` or `SchedulesRangeResponse` or `TheatersResponse` |
| `404` | unknown path | AdonisJS default error |
| `422` | invalid `days` param | `ValidationError` |
| `500` | Allocine fetch failure (upstream down) | AdonisJS default error |

## Example requests

```sh
# Theater list (instant, no Allocine)
curl http://localhost:3333/api/v1/theaters

# Today (default)
curl http://localhost:3333/api/v1/theater

# Tomorrow
curl http://localhost:3333/api/v1/theater?days=1

# 7-day range (today + next 6 days)
curl http://localhost:3333/api/v1/theater?days=0-6

# Invalid — returns 422
curl http://localhost:3333/api/v1/theater?days=abc
```