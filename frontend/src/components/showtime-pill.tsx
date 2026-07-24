import { Token } from '@astryxdesign/core/Token';
import { Text } from '@astryxdesign/core/Text';
import type { Showtime } from '../lib/types';
import { isPast } from '../lib/schedule';

interface ShowtimePillProps {
  showtime: Showtime;
  now: Date;
}

/**
 * A single showtime rendered as a clickable pill.
 * - Past showtimes are dimmed.
 * - VOST and avant-première flags surface as small tokens after the time.
 */
export function ShowtimePill({ showtime, now }: ShowtimePillProps) {
  const past = isPast(showtime.startsAt, now);
  return (
    <a
      href={`#showtime-${showtime.startsAt}`}
      onClick={(e) => e.preventDefault()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-1)',
        padding: 'var(--spacing-1) var(--spacing-2)',
        borderRadius: 'var(--radius-element)',
        textDecoration: 'none',
        backgroundColor: past
          ? 'var(--color-background-muted)'
          : 'var(--color-accent-muted)',
        border: past
          ? '1px solid var(--color-border)'
          : '1px solid var(--color-border-blue)',
        opacity: past ? 0.45 : 1,
        transition: 'opacity 150ms ease, background-color 150ms ease',
      }}
    >
      <Text
        type="label"
        weight="semibold"
        color={past ? 'secondary' : 'accent'}
        hasTabularNumbers
      >
        {showtime.time}
      </Text>
      {showtime.isVost && (
        <Token label="VOST" size="sm" color="blue" />
      )}
      {showtime.isPreview && (
        <Token label="Avant-première" size="sm" color="orange" />
      )}
    </a>
  );
}