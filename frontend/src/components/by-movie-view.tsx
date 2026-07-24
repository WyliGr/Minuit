import type { TheaterSlice } from '../lib/types';
import { formatRuntime, groupByMovie, isPast } from '../lib/schedule';

interface ByMovieViewProps {
  theaters: TheaterSlice[];
  now: Date;
}

export function ByMovieView({ theaters, now }: ByMovieViewProps) {
  const groups = groupByMovie(theaters);

  if (groups.length === 0) return null;

  return (
    <div>
      {groups.map((g, i) => {
        const totalShows = g.venues.reduce(
          (n, v) => n + v.showtimes.length,
          0,
        );
        return (
          <section
            key={g.title}
            className="mn-film mn-reveal"
            style={{ transitionDelay: `${Math.min(i * 0.04, 0.24)}s` }}
          >
            <span className="mn-film-index">
              {String(i + 1).padStart(2, '0')} / {String(groups.length).padStart(2, '0')}
            </span>
            <div className="mn-film-header">
              <h2 className="mn-film-title">{g.title}</h2>
              <div className="mn-film-meta">
                <span className="mn-film-runtime">{formatRuntime(g.runtime)}</span>
                <span className="mn-film-count">
                  {totalShows} {totalShows > 1 ? 'séances' : 'séance'}
                </span>
              </div>
            </div>
            {g.venues.map((v) => (
              <div key={v.slug} className="mn-venue">
                <span className="mn-venue-name">{v.name}</span>
                <div className="mn-showtimes">
                  {v.showtimes.map((s) => (
                    <a
                      key={s.startsAt}
                      className="mn-showtime"
                      data-past={isPast(s.startsAt, now)}
                      href={`#showtime-${s.startsAt}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      {s.time}
                      {s.isVost && <span className="mn-showtime-flag">VOST</span>}
                      {s.isPreview && (
                        <span className="mn-showtime-flag">AVANT</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}