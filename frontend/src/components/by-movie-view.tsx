import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, StackItem, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { ShowtimePill } from './showtime-pill';
import type { TheaterSlice } from '../lib/types';
import { formatRuntime, groupByMovie } from '../lib/schedule';

interface ByMovieViewProps {
  theaters: TheaterSlice[];
  /** Slugs of theaters the user has selected (empty = all). */
  selectedSlugs: Set<string>;
  now: Date;
}

export function ByMovieView({ theaters, selectedSlugs, now }: ByMovieViewProps) {
  const filtered = filterTheaters(theaters, selectedSlugs);
  const groups = groupByMovie(filtered);

  if (groups.length === 0) {
    return null;
  }

  return (
    <>
      {groups.map((g, idx) => {
        const totalShows = g.venues.reduce((n, v) => n + v.showtimes.length, 0);
        return (
          <VStack key={g.title} gap={3} paddingBlock={5} paddingInline={6}>
            {idx > 0 && <Divider variant="subtle" isFullBleed />}
            <HStack hAlign="between" vAlign="center" wrap="wrap" gap={2}>
              <StackItem size="fill">
                <Heading level={3} color="primary" maxLines={2}>
                  {g.title}
                </Heading>
              </StackItem>
              <HStack gap={2} vAlign="center">
                <Text type="supporting" hasTabularNumbers>
                  {formatRuntime(g.runtime)}
                </Text>
                <Text type="supporting">·</Text>
                <Text type="supporting" hasTabularNumbers>
                  {totalShows} {totalShows > 1 ? 'séances' : 'séance'}
                </Text>
              </HStack>
            </HStack>
            <VStack gap={2}>
              {g.venues.map((v) => (
                <HStack
                  key={v.slug}
                  gap={4}
                  vAlign="center"
                  wrap="wrap"
                  hAlign="start"
                >
                  <StackItem size="static">
                    <Text type="label" color="secondary" weight="medium">
                      {v.name}
                    </Text>
                  </StackItem>
                  <StackItem size="fill">
                    <HStack gap={1} wrap="wrap" vAlign="center">
                      {v.showtimes.map((s) => (
                        <ShowtimePill
                          key={s.startsAt}
                          showtime={s}
                          now={now}
                        />
                      ))}
                    </HStack>
                  </StackItem>
                </HStack>
              ))}
            </VStack>
          </VStack>
        );
      })}
    </>
  );
}

function filterTheaters(
  theaters: TheaterSlice[],
  selected: Set<string>,
): TheaterSlice[] {
  if (selected.size === 0) return theaters;
  return theaters.filter((t) => selected.has(t.slug));
}