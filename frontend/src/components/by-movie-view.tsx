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
      {groups.map((g) => {
        const totalShows = g.venues.reduce(
          (n, v) => n + v.showtimes.length,
          0,
        );
        return (
          <section key={g.title} className="minuit-film">
            <div className="minuit-film-header">
              <h2 className="minuit-film-title">{g.title}</h2>
              <span className="minuit-film-runtime">
                {formatRuntime(g.runtime)} · {totalShows}{' '}
                {totalShows > 1 ? 'séances' : 'séance'}
              </span>
            </div>
            {g.venues.map((v) => (
              <div key={v.slug} className="minuit-venue">
                <span className="minuit-venue-name">{v.name}</span>
                <div className="minuit-showtimes">
                  {v.showtimes.map((s) => (
                    <a
                      key={s.startsAt}
                      className="minuit-showtime"
                      data-past={isPast(s.startsAt, now)}
                      href={`#showtime-${s.startsAt}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      {s.time}
                      {s.isVost && <span className="minuit-showtime-flag">VOST</span>}
                      {s.isPreview && (
                        <span className="minuit-showtime-flag">AVANT</span>
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