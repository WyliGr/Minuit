import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Divider } from '@astryxdesign/core/Divider';
import { HStack, VStack } from '@astryxdesign/core/Stack';

/** Skeleton shaped like the By Movie list (title row + 2 venue rows). */
export function ScheduleSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <VStack key={i} gap={3} paddingBlock={5} paddingInline={6}>
          {i > 0 && <Divider variant="subtle" isFullBleed />}
          <HStack hAlign="between" vAlign="center">
            <Skeleton width={240} height={24} radius={3} index={i * 3} />
            <Skeleton width={80} height={16} radius={2} index={i * 3 + 1} />
          </HStack>
          {Array.from({ length: 2 }).map((_, j) => (
            <HStack key={j} gap={4} vAlign="center">
              <Skeleton width={120} height={16} radius={2} index={i * 3 + j + 2} />
              <HStack gap={1} wrap="wrap">
                {Array.from({ length: 4 }).map((_, k) => (
                  <Skeleton
                    key={k}
                    width={56}
                    height={28}
                    radius="rounded"
                    index={i * 6 + j * 4 + k}
                  />
                ))}
              </HStack>
            </HStack>
          ))}
        </VStack>
      ))}
    </>
  );
}

/** Inline skeleton for theater filter pills. */
export function FilterSkeleton() {
  return (
    <HStack gap={1} wrap="wrap" vAlign="center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} width={120 + i * 20} height={32} radius="rounded" index={i} />
      ))}
    </HStack>
  );
}