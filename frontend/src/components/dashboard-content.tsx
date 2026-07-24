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
import { useScrollReveal } from './use-scroll-reveal';

type ViewMode = 'movie' | 'time';
const MAX_DAY_OFFSET = 30;

export function DashboardContent() {
  const { theaters, theatersStatus, days, loadingDays, errors, loadDay } =
    useSchedule();

  const [selectedDay, setSelectedDay] = useState(0);
  const [view, setView] = useState<ViewMode>('movie');
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => new Date());

  // Reveal-on-scroll for the content region. Re-runs when view/day change
  // so newly-mounted sections animate in. Reduced-motion safe (the hook
  // checks matchMedia and the CSS forces visible under reduced-motion).
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollReveal(contentRef);

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

  // Split the French displayDate ("vendredi 24 juillet") into a day-name
  // (italic, brass) and the rest (roman, bone) for the editorial hero.
  const heroDate = day?.displayDate ?? '';
  const heroDateParts = heroDate.split(' ');
  const heroDayName = heroDateParts[0] ?? '';
  const heroDateRest = heroDateParts.slice(1).join(' ');

  return (
    <div className="mn-app">
      {/* ── Editorial hero band (scrolls away) ─────────────────────── */}
      <header className="mn-hero mn-container">
        <div className="mn-hero-top">
          <div className="mn-wordmark">
            <span className="mn-wordmark-text">
              Min<em>u</em>it
            </span>
            <span className="mn-wordmark-tag">Strasbourg</span>
          </div>
          {freshest && (
            <div className="mn-freshness" title="Dernière mise à jour Allocine">
              <span className="mn-freshness-dot" aria-hidden="true" />
              <span className="mn-wordmark-tag">
                Maj {formatFreshness(freshest, now)}
              </span>
            </div>
          )}
        </div>

        {day ? (
          <h1 className="mn-hero-date">
            <em>{heroDayName}</em>
            {heroDateRest ? ` ${heroDateRest}` : ''}
          </h1>
        ) : (
          <h1 className="mn-hero-date">
            <em>Minuit</em>
          </h1>
        )}

        {day && (
          <div className="mn-hero-stats">
            <div className="mn-stat">
              <span className="mn-stat-number">{stats.films}</span>
              <span className="mn-stat-label">
                {stats.films > 1 ? 'Films à l\u2019affiche' : 'Film à l\u2019affiche'}
              </span>
            </div>
            <div className="mn-stat">
              <span className="mn-stat-number">{stats.shows}</span>
              <span className="mn-stat-label">
                {stats.shows > 1 ? 'Séances' : 'Séance'}
              </span>
            </div>
            <div className="mn-stat">
              <span className="mn-stat-number">{filteredTheaters.length}</span>
              <span className="mn-stat-label">
                {filteredTheaters.length > 1 ? 'Salles' : 'Salle'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ── Floating control island (sticky) ──────────────────────── */}
      <div className="mn-island-wrap">
        <div className="mn-island">
          <div className="mn-island-row">
            {day && (
              <span className="mn-island-date-chip">
                J+{day.dayOffset}
                <span>·</span>
                {heroDate}
              </span>
            )}
            <DayStrip
              selectedDay={selectedDay}
              onSelect={setSelectedDay}
              maxOffset={MAX_DAY_OFFSET}
            />
          </div>
          <div className="mn-island-row">
            {theatersStatus === 'loading' ? (
              <div
                className="mn-skeleton-line"
                style={{ width: '100%', height: 34 }}
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
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="mn-content mn-container" ref={contentRef}>
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

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="mn-footer mn-container">
        <div className="mn-footer-row">
          <span>
            Données Allocine · cache 6h · {theaters.length} salle
            {theaters.length > 1 ? 's' : ''}
          </span>
          <span>Minuit</span>
        </div>
      </footer>
    </div>
  );
}