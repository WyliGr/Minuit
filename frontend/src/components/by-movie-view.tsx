import { Film } from 'lucide-react';
import type { TheaterSlice } from '../lib/types';
import { formatRuntime, groupByMovie, isPast } from '../lib/schedule';

interface ByMovieViewProps {
  theaters: TheaterSlice[];
  now: Date;
}

export function ByMovieView({ theaters, now }: ByMovieViewProps) {
  const groups = groupByMovie(theaters);

  if (groups.length === 0) return null;

  const totalFilms = groups.length;
  const totalShows = groups.reduce(
    (n, g) => n + g.venues.reduce((m, v) => m + v.showtimes.length, 0),
    0,
  );

  return (
    <div>
      <header className="mn-section-head">
        <h2 className="mn-section-title">Programmation · par film</h2>
        <span className="mn-section-count">
          {totalFilms} films · {totalShows} séances
        </span>
      </header>

      {groups.map((g, i) => {
        const totalShows = g.venues.reduce(
          (n, v) => n + v.showtimes.length,
          0,
        );
        return (
          <section
            key={g.title}
            className="mn-film mn-reveal"
            style={{ transitionDelay: `${Math.min(i * 0.03, 0.2)}s` }}
          >
            <header className="mn-film-head">
              <span className="mn-film-index">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mn-film-title">{g.title}</h3>
              <div className="mn-film-meta">
                <span className="mn-film-runtime">
                  {formatRuntime(g.runtime)}
                </span>
                <span className="mn-film-count">
                  {totalShows} {totalShows > 1 ? 'séances' : 'séance'}
                </span>
              </div>
            </header>

            <div className="mn-venues">
              {g.venues.map((v) => (
                <div key={v.slug} className="mn-venue">
                  <span className="mn-venue-name">{v.name}</span>
                  <div className="mn-showtimes">
                    {v.showtimes.map((s) => {
                      const past = isPast(s.startsAt, now);
                      return (
                        <button
                          key={s.startsAt}
                          type="button"
                          className="mn-showtime"
                          data-past={past}
                          disabled={past}
                          aria-label={`${s.time} — ${g.title} — ${v.name}${
                            s.isVost ? ' — VOST' : ''
                          }${s.isPreview ? ' — avant-première' : ''}`}
                        >
                          <span>{s.time}</span>
                          {s.isVost && (
                            <span className="mn-showtime-flag">VOST</span>
                          )}
                          {s.isPreview && (
                            <span className="mn-showtime-flag">
                              <Film size={9} strokeWidth={2} aria-hidden="true" />{' '}
                              AVANT
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

    </div>
  );
}
