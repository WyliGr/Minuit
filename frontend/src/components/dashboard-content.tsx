import { useEffect, useMemo, useRef, useState } from 'react';
import { useSchedule } from '../lib/use-schedule';
import {
  countAllShowtimes,
  countDistinctFilms,
  formatFreshness,
} from '../lib/schedule';
import { DayStrip } from './day-strip';
import { FilterBar } from './filter-bar';
import { ViewToggle } from './view-toggle';
import { ByMovieView } from './by-movie-view';
import { ByTimeView } from './by-time-view';
import { ScheduleSkeleton } from './skeletons';
import { EmptyState, ErrorState } from './state-views';

type ViewMode = 'movie' | 'time';
const MAX_DAY_OFFSET = 30;

export function DashboardContent() {
  const { theaters, theatersStatus, days, loadingDays, errors, loadDay } =
    useSchedule();

  const [selectedDay, setSelectedDay] = useState(0);
  const [view, setView] = useState<ViewMode>('movie');
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => new Date());
  const topbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    loadDay(selectedDay);
  }, [selectedDay, loadDay]);

  // Spotlight: drive the radial glow via CSS vars on the fixed overlay.
  // Uses rAF throttling + only updates when the pointer actually moves,
  // so it never touches React state (no re-renders).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let mx = 50;
    let my = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 100;
      my = (e.clientY / window.innerHeight) * 100;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.documentElement.style.setProperty('--mx', `${mx}%`);
        document.documentElement.style.setProperty('--my', `${my}%`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const day = days.get(selectedDay);
  const isLoading = loadingDays.has(selectedDay) && !day;
  const error = errors.get(selectedDay);

  const filteredTheaters = useMemo(() => {
    if (!day) return [];
    if (selectedSlugs.size === 0) return day.theaters;
    return day.theaters.filter((t) => selectedSlugs.has(t.slug));
  }, [day, selectedSlugs]);

  const stats = useMemo(() => {
    if (!day) return { shows: 0, films: 0 };
    return {
      shows: countAllShowtimes(filteredTheaters),
      films: countDistinctFilms(filteredTheaters),
    };
  }, [day, filteredTheaters]);

  const freshest = useMemo(() => {
    if (filteredTheaters.length === 0) return null;
    return filteredTheaters.reduce((min, t) =>
      t.lastFetchedAt < min ? t.lastFetchedAt : min,
      filteredTheaters[0].lastFetchedAt,
    );
  }, [filteredTheaters]);

  const viewLabel =
    view === 'movie' ? 'Par film' : 'Par heure';

  return (
    <div className="mn-app">
      {/* ── Left rail ────────────────────────────────────────────── */}
      <aside className="mn-rail">
        <div className="mn-brand">
          <span className="mn-brand-mark">
            Min<span>u</span>it
          </span>
          <span className="mn-brand-dim">STRBOURG</span>
        </div>

        <div className="mn-rail-section">
          <p className="mn-rail-label">Salles</p>
          {theatersStatus === 'loading' ? (
            <div
              className="mn-skeleton-line"
              style={{ width: '100%', height: 28, marginBottom: 6 }}
            />
          ) : (
            <FilterBar
              theaters={theaters}
              selected={selectedSlugs}
              onChange={setSelectedSlugs}
            />
          )}
        </div>
      </aside>

      {/* ── Main column ───────────────────────────────────────────── */}
      <div className="mn-main">
        <header className="mn-topbar" ref={topbarRef}>
          <div className="mn-topbar-left">
            {day && (
              <span className="mn-date-chip">
                {day.displayDate.split(' ').slice(0, 3).join(' ')}
                <span>·</span>
                J+{day.dayOffset}
              </span>
            )}
          </div>
          {day && (
            <div className="mn-stats">
              <span>
                <span className="mn-stat-number">{stats.films}</span>{' '}
                {stats.films > 1 ? 'films' : 'film'}
              </span>
              <span className="mn-stat-sep">/</span>
              <span>
                <span className="mn-stat-number">{stats.shows}</span>{' '}
                {stats.shows > 1 ? 'séances' : 'séance'}
              </span>
              {freshest && (
                <>
                  <span className="mn-stat-sep">/</span>
                  <span className="mn-freshness">
                    <span className="mn-freshness-dot" />
                    maj {formatFreshness(freshest, now)}
                  </span>
                </>
              )}
            </div>
          )}
        </header>

        <DayStrip
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          maxOffset={MAX_DAY_OFFSET}
        />

        <div className="mn-command">
          <ViewToggle view={view} onChange={(v) => setView(v as ViewMode)} />
          <span className="mn-view-meta">{viewLabel}</span>
        </div>

        <main className="mn-content">
          {error ? (
            <ErrorState message={error} onRetry={() => loadDay(selectedDay)} />
          ) : isLoading ? (
            <ScheduleSkeleton />
          ) : !day ? (
            <ScheduleSkeleton />
          ) : filteredTheaters.length === 0 ||
            filteredTheaters.every((t) => t.films.length === 0) ? (
            <EmptyState />
          ) : view === 'movie' ? (
            <ByMovieView theaters={filteredTheaters} now={now} />
          ) : (
            <ByTimeView theaters={filteredTheaters} now={now} />
          )}
        </main>

        <footer className="mn-footer">
          Données Allocine · cache 6h · {theaters.length} salle
          {theaters.length > 1 ? 's' : ''} active
          {theaters.length > 1 ? 's' : ''}
        </footer>
      </div>
    </div>
  );
}