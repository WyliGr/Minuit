import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav } from '@astryxdesign/core/TopNav';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { SegmentedControl } from '@astryxdesign/core/SegmentedControl';
import { SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Section } from '@astryxdesign/core/Section';
import { Divider } from '@astryxdesign/core/Divider';
import { ThemeProvider } from './theme-provider';
import { TheaterFilterBar } from './theater-filter-bar';
import { ByMovieView } from './by-movie-view';
import { ByTimeView } from './by-time-view';
import { FilterSkeleton, ScheduleSkeleton } from './schedule-states';
import { DayError, NoShowtimesEmpty, TheatersError } from './state-views';
import { useSchedule } from '../lib/use-schedule';
import {
  countAllShowtimes,
  countDistinctFilms,
  formatFreshness,
} from '../lib/schedule';

type ViewMode = 'movie' | 'time';

const MAX_DAY_OFFSET = 30;
const DEFAULT_DAY = 0;

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}

function DashboardContent() {
  const {
    theaters,
    theatersStatus,
    days,
    loadingDays,
    errors,
    loadDay,
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState(DEFAULT_DAY);
  const [view, setView] = useState<ViewMode>('movie');
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => new Date());

  // Tick "now" every minute so past-showtime dimming stays fresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  // Load the selected day whenever it changes.
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

  const canGoPrev = selectedDay > 0;
  const canGoNext = selectedDay < MAX_DAY_OFFSET;

  return (
    <AppShell
      height="auto"
      variant="wash"
      contentPadding={0}
      topNav={
        <TopNav
          heading={
            <HStack gap={2} vAlign="center">
              <Heading level={1} type="display-2" color="primary">
                Minuit
              </Heading>
            </HStack>
          }
          endContent={
            <HStack gap={3} vAlign="center">
              <DayStepper
                displayDate={day?.displayDate ?? '—'}
                dayOffset={selectedDay}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                onPrev={() => setSelectedDay((d) => Math.max(0, d - 1))}
                onNext={() =>
                  setSelectedDay((d) => Math.min(MAX_DAY_OFFSET, d + 1))
                }
              />
            </HStack>
          }
        />
      }
    >
      <VStack gap={0}>
        {/* Sticky toolbar: filters + view switch + stats */}
        <Section
          variant="section"
          padding={3}
          dividers={['bottom']}
        >
          <VStack gap={2}>
            {theatersStatus === 'loading' ? (
              <FilterSkeleton />
            ) : theatersStatus === 'error' ? (
              <TheatersError onRetry={() => window.location.reload()} />
            ) : (
              <TheaterFilterBar
                theaters={theaters}
                selected={selectedSlugs}
                onChange={setSelectedSlugs}
              />
            )}
            <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
              <SegmentedControl
                label="Mode d'affichage"
                value={view}
                onChange={(v) => setView(v as ViewMode)}
                size="sm"
              >
                <SegmentedControlItem value="movie" label="Par film" />
                <SegmentedControlItem value="time" label="Par heure" />
              </SegmentedControl>
              {day && (
                <HStack gap={2} vAlign="center">
                  <Text type="supporting" hasTabularNumbers>
                    {stats.films} {stats.films > 1 ? 'films' : 'film'}
                  </Text>
                  <Text type="supporting">·</Text>
                  <Text type="supporting" hasTabularNumbers>
                    {stats.shows} {stats.shows > 1 ? 'séances' : 'séance'}
                  </Text>
                  {(() => {
                    const freshest = filteredTheaters.reduce<string | null>(
                      (acc, t) =>
                        acc === null || t.lastFetchedAt < acc
                          ? t.lastFetchedAt
                          : acc,
                      null,
                    );
                    if (!freshest) return null;
                    return (
                      <>
                        <Text type="supporting">·</Text>
                        <Text type="supporting">
                          maj {formatFreshness(freshest, now)}
                        </Text>
                      </>
                    );
                  })()}
                </HStack>
              )}
            </HStack>
          </VStack>
        </Section>

        {/* Body: schedule content */}
        <Section variant="transparent" padding={0}>
          {error ? (
            <VStack padding={4}>
              <DayError message={error} onRetry={() => loadDay(selectedDay)} />
            </VStack>
          ) : isLoading ? (
            <ScheduleSkeleton />
          ) : !day ? (
            <ScheduleSkeleton />
          ) : filteredTheaters.length === 0 ||
            filteredTheaters.every((t) => t.films.length === 0) ? (
            <VStack padding={6}>
              <NoShowtimesEmpty />
            </VStack>
          ) : view === 'movie' ? (
            <ByMovieView
              theaters={filteredTheaters}
              selectedSlugs={selectedSlugs}
              now={now}
            />
          ) : (
            <ByTimeView
              theaters={filteredTheaters}
              selectedSlugs={selectedSlugs}
              now={now}
            />
          )}
        </Section>

        <Divider variant="subtle" />
        <Section variant="transparent" padding={3}>
          <Text type="supporting" color="secondary">
            Données Allocine · cache 6 h ·{' '}
            {theaters.length} salle{theaters.length > 1 ? 's' : ''} active
            {theaters.length > 1 ? 's' : ''}
          </Text>
        </Section>
      </VStack>
    </AppShell>
  );
}

interface DayStepperProps {
  displayDate: string;
  dayOffset: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function DayStepper({
  displayDate,
  dayOffset,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: DayStepperProps) {
  const label = dayOffset === 0 ? "Aujourd'hui" : dayOffset === 1 ? 'Demain' : `J+${dayOffset}`;
  return (
    <HStack gap={2} vAlign="center">
      <IconButton
        icon={<Icon icon="chevronLeft" />}
        label="Jour précédent"
        variant="ghost"
        size="sm"
        isDisabled={!canGoPrev}
        onClick={onPrev}
      />
      <VStack gap={0} vAlign="center" hAlign="center">
        <Text type="body" weight="semibold" color="primary">
          {displayDate}
        </Text>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </VStack>
      <IconButton
        icon={<Icon icon="chevronRight" />}
        label="Jour suivant"
        variant="ghost"
        size="sm"
        isDisabled={!canGoNext}
        onClick={onNext}
      />
    </HStack>
  );
}