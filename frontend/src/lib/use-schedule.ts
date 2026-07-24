import { useEffect, useState } from 'react';
import {
  ApiError,
  fetchSchedule,
  fetchScheduleRange,
  fetchTheaters,
} from './api';
import type {
  SchedulesResponse,
  TheaterListItem,
  TheaterSlice,
} from './types';

export interface DaySchedule {
  dayOffset: number;
  date: string;
  displayDate: string;
  generatedAt: string;
  theaters: TheaterSlice[];
}

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseScheduleState {
  theaters: TheaterListItem[];
  theatersStatus: LoadStatus;
  /** Loaded days keyed by dayOffset. */
  days: Map<number, DaySchedule>;
  /** Currently-loading day offsets. */
  loadingDays: Set<number>;
  /** Errors keyed by dayOffset (-1 for theater-list error). */
  errors: Map<number, string>;
}

export function useSchedule() {
  const [theaters, setTheaters] = useState<TheaterListItem[]>([]);
  const [theatersStatus, setTheatersStatus] = useState<LoadStatus>('idle');
  const [days, setDays] = useState<Map<number, DaySchedule>>(new Map());
  const [loadingDays, setLoadingDays] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Map<number, string>>(new Map());

  // Load theater list once on mount.
  useEffect(() => {
    let cancelled = false;
    setTheatersStatus('loading');
    fetchTheaters()
      .then((r) => {
        if (cancelled) return;
        setTheaters(r.theaters);
        setTheatersStatus('success');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setTheatersStatus('error');
        setErrors((prev) => {
          const next = new Map(prev);
          next.set(-1, errMsg(e));
          return next;
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadDay = async (offset: number) => {
    if (loadingDays.has(offset) || days.has(offset)) return;
    setLoadingDays((prev) => new Set(prev).add(offset));
    try {
      const r = await fetchSchedule(offset);
      setDays((prev) => {
        const next = new Map(prev);
        next.set(offset, toDaySchedule(r));
        return next;
      });
      setErrors((prev) => {
        if (!prev.has(offset)) return prev;
        const next = new Map(prev);
        next.delete(offset);
        return next;
      });
    } catch (e: unknown) {
      setErrors((prev) => {
        const next = new Map(prev);
        next.set(offset, errMsg(e));
        return next;
      });
    } finally {
      setLoadingDays((prev) => {
        const next = new Set(prev);
        next.delete(offset);
        return next;
      });
    }
  };

  const loadRange = async (from: number, to: number) => {
    const missing: number[] = [];
    for (let o = from; o <= to; o++) {
      if (!days.has(o) && !loadingDays.has(o)) missing.push(o);
    }
    if (missing.length === 0) return;
    // Mark all as loading.
    setLoadingDays((prev) => {
      const next = new Set(prev);
      for (const o of missing) next.add(o);
      return next;
    });
    try {
      const r = await fetchScheduleRange(from, to);
      setDays((prev) => {
        const next = new Map(prev);
        for (const d of r.days) next.set(d.dayOffset, toDaySchedule(d));
        return next;
      });
      setErrors((prev) => {
        const next = new Map(prev);
        for (const o of missing) next.delete(o);
        return next;
      });
    } catch (e: unknown) {
      // Fallback: load each day individually so a single bad day doesn't sink all.
      setLoadingDays((prev) => {
        const next = new Set(prev);
        for (const o of missing) next.delete(o);
        return next;
      });
      await Promise.allSettled(missing.map((o) => loadDay(o)));
    } finally {
      setLoadingDays((prev) => {
        const next = new Set(prev);
        for (const o of missing) next.delete(o);
        return next;
      });
    }
  };

  return {
    theaters,
    theatersStatus,
    days,
    loadingDays,
    errors,
    loadDay,
    loadRange,
  };
}

function toDaySchedule(r: SchedulesResponse): DaySchedule {
  return {
    dayOffset: r.dayOffset,
    date: r.date,
    displayDate: r.displayDate,
    generatedAt: r.generatedAt,
    theaters: r.theaters,
  };
}

function errMsg(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.vineErrors && e.vineErrors.length > 0) {
      return e.vineErrors[0].message;
    }
    return `${e.status}: ${e.message}`;
  }
  if (e instanceof Error) return e.message;
  return 'Erreur inconnue';
}