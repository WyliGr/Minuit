import type { TheaterSlice } from '../lib/types';
import { bucketByHour, groupByTime, isPast } from '../lib/schedule';

interface ByTimeViewProps {
  theaters: TheaterSlice[];
  now: Date;
}

export function ByTimeView({ theaters, now }: ByTimeViewProps) {
  const rows = groupByTime(theaters);
  const buckets = bucketByHour(rows);

  if (buckets.length === 0) return null;

  return (
    <div>
      {buckets.map((b, i) => (
        <div
          key={b.hour}
          className="mn-time-hour mn-reveal"
          style={{ transitionDelay: `${Math.min(i * 0.04, 0.24)}s` }}
        >
          <span className="mn-time-hour-label">{b.hour}</span>
          <div className="mn-time-rows">
            {b.rows.map((r) => (
              <div
                key={r.startsAt + r.theaterSlug}
                className="mn-time-row"
                data-past={isPast(r.startsAt, now)}
              >
                <span className="mn-time-time">{r.time}</span>
                <span className="mn-time-title">{r.title}</span>
                <span className="mn-time-theater">{r.theaterName}</span>
                {r.isVost && <span className="mn-showtime-flag">VOST</span>}
                {r.isPreview && (
                  <span className="mn-showtime-flag">AVANT</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}