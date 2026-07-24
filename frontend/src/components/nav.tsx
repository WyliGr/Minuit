import { formatFreshness } from '../lib/schedule';

interface NavProps {
  freshest: string | null;
  now: Date;
  theaterCount: number;
}

export function Nav({ freshest, now, theaterCount }: NavProps) {
  return (
    <header className="mn-nav">
      <div className="mn-container mn-nav-row">
        <span className="mn-wordmark" aria-label="Minuit">
          <span className="mn-wordmark-dot" aria-hidden="true" />
          Minuit
        </span>
        <div className="mn-nav-meta" aria-live="polite">
          {freshest && (
            <span className="mn-nav-status">
              <span className="mn-nav-status-dot" aria-hidden="true" />
              <span className="mn-nav-status-text">
                Maj {formatFreshness(freshest, now)}
              </span>
            </span>
          )}
          {freshest && (
            <span className="mn-nav-divider" aria-hidden="true" />
          )}
          <span className="mn-nav-count">
            {theaterCount} {theaterCount > 1 ? 'salles' : 'salle'}
          </span>
        </div>
      </div>
    </header>
  );
}
