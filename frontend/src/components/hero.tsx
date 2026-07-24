import type { DaySchedule } from '../lib/use-schedule';

interface Stats {
  shows: number;
  films: number;
  theaters: number;
}

interface HeroProps {
  day: DaySchedule | null;
  stats: Stats;
}

export function Hero({ day, stats }: HeroProps) {
  if (!day) {
    return (
      <section className="mn-hero mn-container" aria-busy="true">
        <div className="mn-hero-grid">
          <div>
            <div className="mn-hero-eyebrow">
              <span className="mn-hero-eyebrow-bar" aria-hidden="true" />
              <span>Chargement</span>
            </div>
            <h1 className="mn-hero-date">Minuit</h1>
            <p className="mn-hero-date-num" aria-hidden="true">
              Chargement des séances
            </p>
          </div>
        </div>
      </section>
    );
  }

  const [dayName, ...rest] = day.displayDate.split(' ');
  const dateRest = rest.join(' ');

  return (
    <section className="mn-hero mn-container">
      <div className="mn-hero-grid">
        <div>
          <div className="mn-hero-eyebrow">
            <span className="mn-hero-eyebrow-bar" aria-hidden="true" />
            <span className="mn-hero-eyebrow-label-desktop">Séances en salle</span>
            <span className="mn-hero-eyebrow-label-mobile">
              {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
            </span>
          </div>
          <h1 className="mn-hero-date">
            <span className="mn-hero-date-desktop">
              {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
            </span>
            <span className="mn-hero-date-mobile">{dateRest}</span>
          </h1>
          <p className="mn-hero-date-num">
            {dateRest} · J{day.dayOffset === 0 ? '' : '+'}
            {day.dayOffset}
          </p>
        </div>

        <div className="mn-hero-side">
          <div className="mn-hero-stats">
            <div className="mn-stat">
              <span className="mn-stat-value">{stats.films}</span>
              <span className="mn-stat-label">
                {stats.films > 1 ? 'Films' : 'Film'}
              </span>
            </div>
            <div className="mn-stat">
              <span className="mn-stat-value">{stats.shows}</span>
              <span className="mn-stat-label">
                {stats.shows > 1 ? 'Séances' : 'Séance'}
              </span>
            </div>
            <div className="mn-stat">
              <span className="mn-stat-value">{stats.theaters}</span>
              <span className="mn-stat-label">
                {stats.theaters > 1 ? 'Salles' : 'Salle'}
              </span>
            </div>
          </div>

          <p className="mn-hero-meta-mobile">
            <strong>{stats.shows}</strong>{' '}
            {stats.shows > 1 ? 'séances' : 'séance'}
            {' · '}
            <strong>{stats.theaters}</strong>{' '}
            {stats.theaters > 1 ? 'salles' : 'salle'}
          </p>

          <div className="mn-hero-meta" aria-label="Détails">
            <div className="mn-hero-meta-row">
              <span className="mn-hero-meta-key">Date</span>
              <span className="mn-hero-meta-val">{day.date}</span>
            </div>
            <div className="mn-hero-meta-row">
              <span className="mn-hero-meta-key">Cache</span>
              <span className="mn-hero-meta-val">6h</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
