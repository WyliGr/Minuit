import { HStack, StackItem, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { Divider } from '@astryxdesign/core/Divider';
import type { TheaterSlice } from '../lib/types';
import { bucketByHour, formatRuntime, groupByTime, isPast } from '../lib/schedule';

interface ByTimeViewProps {
  theaters: TheaterSlice[];
  selectedSlugs: Set<string>;
  now: Date;
}

export function ByTimeView({ theaters, selectedSlugs, now }: ByTimeViewProps) {
  const filtered =
    selectedSlugs.size === 0
      ? theaters
      : theaters.filter((t) => selectedSlugs.has(t.slug));
  const rows = groupByTime(filtered);
  const buckets = bucketByHour(rows);

  if (buckets.length === 0) return null;

  return (
    <VStack gap={0}>
      {buckets.map((b) => (
        <VStack key={b.hour} gap={1} paddingBlock={4} paddingInline={6}>
          <HStack gap={3} vAlign="center" hAlign="start">
            <StackItem size="static">
              <Text
                type="display-2"
                color="secondary"
                weight="semibold"
                hasTabularNumbers
              >
                {b.hour}
              </Text>
            </StackItem>
            <StackItem size="fill">
              <VStack gap={0}>
                {b.rows.map((r, idx) => {
                  const past = isPast(r.startsAt, now);
                  return (
                    <VStack key={r.startsAt + r.theaterSlug} gap={0}>
                      {idx > 0 && <Divider variant="subtle" />}
                      <HStack
                        gap={3}
                        vAlign="center"
                        wrap="wrap"
                        paddingBlock={2}
                      >
                        <StackItem size="static">
                          <Text
                            type="body"
                            weight="semibold"
                            color={past ? 'secondary' : 'accent'}
                            hasTabularNumbers
                          >
                            {r.time}
                          </Text>
                        </StackItem>
                        <StackItem size="fill">
                          <HStack gap={2} vAlign="center" wrap="wrap">
                            <Text
                              type="body"
                              weight="semibold"
                              color={past ? 'secondary' : 'primary'}
                              maxLines={1}
                            >
                              {r.title}
                            </Text>
                            <Text type="supporting" hasTabularNumbers>
                              {formatRuntime(r.runtime)}
                            </Text>
                          </HStack>
                        </StackItem>
                        <StackItem size="static">
                          <HStack gap={1} vAlign="center">
                            <Text type="label" color="secondary">
                              {r.theaterName}
                            </Text>
                            {r.isVost && (
                              <Token label="VOST" size="sm" color="blue" />
                            )}
                            {r.isPreview && (
                              <Token label="Av." size="sm" color="orange" />
                            )}
                          </HStack>
                        </StackItem>
                      </HStack>
                    </VStack>
                  );
                })}
              </VStack>
            </StackItem>
          </HStack>
        </VStack>
      ))}
    </VStack>
  );
}