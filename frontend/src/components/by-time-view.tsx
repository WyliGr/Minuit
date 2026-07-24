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
      {buckets.map((b) => (
        <div key={b.hour} className="minuit-time-hour">
          <span className="minuit-time-hour-label">{b.hour}</span>
          <div className="minuit-time-rows">
            {b.rows.map((r) => (
              <div
                key={r.startsAt + r.theaterSlug}
                className="minuit-time-row"
                data-past={isPast(r.startsAt, now)}
              >
                <span className="minuit-time-time">{r.time}</span>
                <span className="minuit-time-title">{r.title}</span>
                <span className="minuit-time-theater">{r.theaterName}</span>
                {r.isVost && (
                  <span className="minuit-showtime-flag">VOST</span>
                )}
                {r.isPreview && (
                  <span className="minuit-showtime-flag">AVANT</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}