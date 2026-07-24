import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    loadDay(selectedDay);
  }, [selectedDay, loadDay]);

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

  return (
    <div className="minuit-app">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="minuit-header">
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding:
              'var(--spacing-4, 16px) var(--spacing-6, 24px) var(--spacing-3, 12px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--spacing-4, 16px)',
              marginBottom: 'var(--spacing-4, 16px)',
              flexWrap: 'wrap',
            }}
          >
            <h1 className="minuit-wordmark">
              Min<span className="minuit-wordmark-accent">u</span>it
            </h1>
            {day && (
              <div className="minuit-stats">
                <span>
                  <span className="minuit-stat-number">{stats.films}</span>{' '}
                  {stats.films > 1 ? 'films' : 'film'}
                </span>
                <span className="minuit-stat-separator">·</span>
                <span>
                  <span className="minuit-stat-number">{stats.shows}</span>{' '}
                  {stats.shows > 1 ? 'séances' : 'séance'}
                </span>
                {freshest && (
                  <>
                    <span className="minuit-stat-separator">·</span>
                    <span className="minuit-freshness">
                      <span className="minuit-freshness-dot" />
                      maj {formatFreshness(freshest, now)}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <DayStrip
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
            maxOffset={MAX_DAY_OFFSET}
          />
        </div>
      </header>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding:
            'var(--spacing-4, 16px) var(--spacing-6, 24px) var(--spacing-2, 8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-4, 16px)',
          flexWrap: 'wrap',
        }}
      >
        {theatersStatus === 'loading' ? (
          <div
            className="minuit-skeleton-line"
            style={{ width: 300, height: 32, borderRadius: 9999 }}
          />
        ) : (
          <FilterBar
            theaters={theaters}
            selected={selectedSlugs}
            onChange={setSelectedSlugs}
          />
        )}
        <ViewToggle view={view} onChange={(v) => setView(v as ViewMode)} />
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--spacing-2, 8px) var(--spacing-6, 24px) var(--spacing-6, 24px)',
        }}
      >
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

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="minuit-footer">
        Données Allocine · cache 6h · {theaters.length} salle
        {theaters.length > 1 ? 's' : ''} active{theaters.length > 1 ? 's' : ''}
      </footer>
    </div>
  );
}