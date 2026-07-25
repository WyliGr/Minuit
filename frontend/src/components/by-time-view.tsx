import { Film } from 'lucide-react';
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

  const totalRows = rows.length;

  return (
    <div>
      <header className="mn-section-head">
        <h2 className="mn-section-title">Programmation · par horaire</h2>
        <span className="mn-section-count">{totalRows} séances</span>
      </header>

      {buckets.map((b, i) => (
        <section
          key={b.hour}
          className="mn-time-bucket mn-reveal"
          style={{ transitionDelay: `${Math.min(i * 0.03, 0.2)}s` }}
        >
          <header className="mn-time-bucket-head">
            <h3 className="mn-time-bucket-hour">{b.hour}</h3>
            <span className="mn-time-bucket-count">
              {b.rows.length} {b.rows.length > 1 ? 'séances' : 'séance'}
            </span>
          </header>
          <div className="mn-time-rows">
            {b.rows.map((r) => (
              <div
                key={r.startsAt + r.theaterSlug}
                className="mn-time-row"
                data-past={isPast(r.startsAt, now)}
              >
                <span className="mn-time-row-time">{r.time}</span>
                <span className="mn-time-row-title">{r.title}</span>
                <span className="mn-time-row-theater">{r.theaterName}</span>
                <span className="mn-time-row-flags">
                  {r.format && (
                    <span
                      className="mn-showtime-flag mn-showtime-flag--format"
                      title={r.format}
                    >
                      {r.format}
                    </span>
                  )}
                  {r.isVost && <span className="mn-showtime-flag">VOST</span>}
                  {r.isPreview && (
                    <span className="mn-showtime-flag">
                      <Film size={9} strokeWidth={2} aria-hidden="true" /> AVANT
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
