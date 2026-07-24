# Minuit API — Agent Reference

Cinema schedule aggregator. Single public endpoint, no auth, cache-first (6h SQLite cache).

## Base URL

- Local dev: `http://localhost:3333`
- Docker: `http://localhost:3333` (compose maps port 3333)

## Endpoints

### `GET /` — Health check

No params. Returns `{ name: "minuit", status: "ok" }`.

### `GET /api/v1/theater` — Get schedules

**Query param:**

| name | type | required | default | range | description |
|------|------|----------|---------|-------|-------------|
| `days` | integer | no | `0` | `0`–`30` | Day offset from today. `0`=today, `1`=tomorrow, etc. |

**Success — `200`**

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

**Validation error — `422`** (VineJS)

Returned when `days` is non-numeric, `< 0`, or `> 30`. Shape:

```json
{
  "errors": [
    { "message": "The days field must be a number", "rule": "number", "field": "days" }
  ]
}
```

Each error has `message` (string), `rule` (`number` | `min` | `max`), `field` (always `days`).

## Response schema

```
SchedulesResponse
├── date          string   YYYY-MM-DD (target day)
├── dayOffset     integer  the requested offset
├── displayDate   string   French human-readable ("vendredi 24 juillet")
├── generatedAt   string   ISO 8601 (when this response was built)
└── theaters[]    TheaterSlice (ordered by theater ID, active only)
    ├── slug      string   URL-safe key ("ugc-cine-cite")
    ├── name      string   display name ("UGC Ciné Cité")
    └── films[]    Film
        ├── title     string   uppercased, quotes stripped
        ├── runtime   integer  minutes (parsed from "3h 07min")
        └── showtimes[] Showtime (sorted by startsAt ascending)
            ├── time      string   "HH:MM" (fr-FR, 24h)
            ├── startsAt  string   ISO 8601 timestamp
            ├── isVost    boolean  true if original version
            └── isPreview boolean  true if avant-première
```

## Behavior notes

- **Today filtering:** when `days=0`, showtimes that started before the request moment are filtered out. Future days (`days >= 1`) include all showtimes.
- **Empty films array:** a theater with no showtimes for the target date returns `films: []`. The theater still appears in the response (it's active).
- **Theater list is dynamic:** controlled by the `theaters` DB table (`is_active` flag). The 5 seeded Strasbourg theaters are `ugc-cine-cite`, `le-cosmos`, `vox`, `star`, `star-st-exupery`. Adding/removing/toggling a theater changes the response without code changes.
- **Caching:** first request for a theater+date fetches from Allocine (~200ms). Subsequent requests within `CACHE_TTL_MINUTES` (default 360 = 6h) return cached data (~10ms). `generatedAt` is when the response was assembled, NOT when the data was fetched from Allocine — use the cache TTL to estimate data freshness.
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
| `200` | success | `SchedulesResponse` |
| `404` | unknown path | AdonisJS default error |
| `422` | invalid `days` param | `ValidationError` |
| `500` | Allocine fetch failure (upstream down) | AdonisJS default error |

## Example requests

```sh
# Today (default)
curl http://localhost:3333/api/v1/theater

# Tomorrow
curl http://localhost:3333/api/v1/theater?days=1

# One week from today
curl http://localhost:3333/api/v1/theater?days=7

# Invalid — returns 422
curl http://localhost:3333/api/v1/theater?days=abc
```