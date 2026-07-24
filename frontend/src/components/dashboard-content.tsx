import { useEffect, useMemo, useRef, useState } from 'react';
import { useSchedule } from '../lib/use-schedule';
import {
  countAllShowtimes,
  countDistinctFilms,
} from '../lib/schedule';
import { Nav } from './nav';
import { Hero } from './hero';
import { Controls } from './controls';
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
    if (!day) return { shows: 0, films: 0, theaters: 0 };
    return {
      shows: countAllShowtimes(filteredTheaters),
      films: countDistinctFilms(filteredTheaters),
      theaters: filteredTheaters.length,
    };
  }, [day, filteredTheaters]);

  const freshest = useMemo(() => {
    if (filteredTheaters.length === 0) return null;
    return filteredTheaters.reduce(
      (min, t) => (t.lastFetchedAt < min ? t.lastFetchedAt : min),
      filteredTheaters[0].lastFetchedAt,
    );
  }, [filteredTheaters]);

  return (
    <div className="mn-app">
      <Nav freshest={freshest} now={now} theaterCount={theaters.length} />

      <Hero day={day ?? null} stats={stats} />

      <Controls
        day={day ?? null}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        maxOffset={MAX_DAY_OFFSET}
        theaters={theaters}
        theatersStatus={theatersStatus}
        selectedSlugs={selectedSlugs}
        onChangeSlugs={setSelectedSlugs}
        view={view}
        onChangeView={setView}
      />

      <main id="main" className="mn-content" ref={contentRef}>
        {error ? (
          <ErrorState message={error} onRetry={() => loadDay(selectedDay)} />
        ) : isLoading || !day ? (
          <ScheduleSkeleton view={view} />
        ) : filteredTheaters.length === 0 ||
          filteredTheaters.every((t) => t.films.length === 0) ? (
          <EmptyState />
        ) : view === 'movie' ? (
          <ByMovieView theaters={filteredTheaters} now={now} />
        ) : (
          <ByTimeView theaters={filteredTheaters} now={now} />
        )}
      </main>

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
