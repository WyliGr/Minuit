import type { Showtime, TheaterSlice } from './types';

/** "2h 46" from minutes. */
export function formatRuntime(minutes: number): string {
  if (!minutes || minutes < 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, '0')}`;
}

/** "il y a 2h" / "à l'instant" from an ISO timestamp. */
export function formatFreshness(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = now.getTime() - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}

/** Total showtime count across all films in a theater slice. */
export function countShowtimes(theater: TheaterSlice): number {
  return theater.films.reduce((n, f) => n + f.showtimes.length, 0);
}

/** Total showtime count across all theaters. */
export function countAllShowtimes(theaters: TheaterSlice[]): number {
  return theaters.reduce((n, t) => n + countShowtimes(t), 0);
}

/** Distinct film titles across theaters. */
export function countDistinctFilms(theaters: TheaterSlice[]): number {
  const titles = new Set<string>();
  for (const t of theaters) for (const f of t.films) titles.add(f.title);
  return titles.size;
}

export interface MovieGroup {
  title: string;
  runtime: number;
  /** First non-null posterUrl found across all venues showing this film. */
  posterUrl: string | null;
  /** (theaterSlug, theaterName, showtimes) per theater showing this film. */
  venues: { slug: string; name: string; showtimes: Showtime[] }[];
}

/** Merge films across theaters by title -> movie groups sorted by first start. */
export function groupByMovie(theaters: TheaterSlice[]): MovieGroup[] {
  const map = new Map<string, MovieGroup>();
  for (const t of theaters) {
    for (const f of t.films) {
      const existing = map.get(f.title);
      if (existing) {
        existing.venues.push({ slug: t.slug, name: t.name, showtimes: f.showtimes });
        if (!existing.posterUrl && f.posterUrl) {
          existing.posterUrl = f.posterUrl;
        }
      } else {
        map.set(f.title, {
          title: f.title,
          runtime: f.runtime,
          posterUrl: f.posterUrl ?? null,
          venues: [{ slug: t.slug, name: t.name, showtimes: f.showtimes }],
        });
      }
    }
  }
  const groups = [...map.values()];
  groups.sort((a, b) => {
    const aFirst = earliestStart(a);
    const bFirst = earliestStart(b);
    return aFirst.localeCompare(bFirst);
  });
  return groups;
}

function earliestStart(g: MovieGroup): string {
  let min = '9999';
  for (const v of g.venues) for (const s of v.showtimes) if (s.startsAt < min) min = s.startsAt;
  return min;
}

export interface TimeRow {
  time: string;
  startsAt: string;
  title: string;
  runtime: number;
  theaterName: string;
  theaterSlug: string;
  isVost: boolean;
  isPreview: boolean;
  format: string | null;
}

/** Flatten all showtimes across theaters into time-sorted rows. */
export function groupByTime(theaters: TheaterSlice[]): TimeRow[] {
  const rows: TimeRow[] = [];
  for (const t of theaters) {
    for (const f of t.films) {
      for (const s of f.showtimes) {
        rows.push({
          time: s.time,
          startsAt: s.startsAt,
          title: f.title,
          runtime: f.runtime,
          theaterName: t.name,
          theaterSlug: t.slug,
          isVost: s.isVost,
          isPreview: s.isPreview,
          format: s.format ?? null,
        });
      }
    }
  }
  rows.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return rows;
}

/** Group time rows by hour bucket "14h", "15h"... for visual grouping. */
export function bucketByHour(rows: TimeRow[]): { hour: string; rows: TimeRow[] }[] {
  const buckets = new Map<string, TimeRow[]>();
  for (const r of rows) {
    const h = r.time.slice(0, 2);
    const key = `${h}h`;
    const arr = buckets.get(key) ?? [];
    arr.push(r);
    buckets.set(key, arr);
  }
  return [...buckets.entries()].map(([hour, rs]) => ({ hour, rows: rs }));
}

/** Whether a showtime is in the past relative to now. */
export function isPast(startsAt: string, now: Date = new Date()): boolean {
  return new Date(startsAt).getTime() < now.getTime();
}