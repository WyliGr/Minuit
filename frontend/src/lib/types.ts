/**
 * Minuit API types — derived from docs/API.md
 * Backend: AdonisJS on :3333. Two public endpoints, no auth.
 */

export interface TheaterListItem {
  slug: string;
  name: string;
  /** SQLite returns 0/1 integer; docs say boolean. Accept both. */
  isActive: boolean | number;
}

export interface TheatersResponse {
  theaters: TheaterListItem[];
}

export interface Showtime {
  /** "HH:MM" 24h fr-FR */
  time: string;
  /** ISO 8601 timestamp */
  startsAt: string;
  isVost: boolean;
  isPreview: boolean;
}

export interface Film {
  /** Uppercased, quotes stripped */
  title: string;
  /** Minutes */
  runtime: number;
  showtimes: Showtime[];
}

export interface TheaterSlice {
  slug: string;
  name: string;
  /** ISO 8601 — when Allocine was last fetched (data freshness) */
  lastFetchedAt: string;
  films: Film[];
}

export interface SchedulesResponse {
  /** YYYY-MM-DD target day */
  date: string;
  dayOffset: number;
  /** French human-readable ("vendredi 24 juillet") */
  displayDate: string;
  /** ISO 8601 — when this response was assembled */
  generatedAt: string;
  theaters: TheaterSlice[];
}

export interface SchedulesRangeResponse {
  days: SchedulesResponse[];
}

export interface VineError {
  message: string;
  rule: string;
  field: string;
}

export interface ValidationError {
  errors: VineError[];
}

/** Single-day: SchedulesResponse. Range: SchedulesRangeResponse. */
export type SchedulesResult = SchedulesResponse | SchedulesRangeResponse;

export function isRangeResponse(r: SchedulesResult): r is SchedulesRangeResponse {
  return 'days' in r && Array.isArray((r as SchedulesRangeResponse).days);
}

export type DayInput = number | `${number}-${number}` | string;