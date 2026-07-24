import { RotateCw, SearchX } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="mn-empty">
      <div className="mn-empty-mark" aria-hidden="true">
        <SearchX size={20} strokeWidth={1.5} />
      </div>
      <h2 className="mn-empty-title">Aucune séance</h2>
      <p className="mn-empty-desc">
        Aucun film ne passe dans les salles sélectionnées ce jour. Essayez un
        autre jour ou élargissez les filtres.
      </p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mn-error" role="alert">
      <div className="mn-error-text">
        <span className="mn-error-title">Impossible de charger les séances</span>
        <span className="mn-error-desc">{message}</span>
      </div>
      <button type="button" className="mn-error-retry" onClick={onRetry}>
        <RotateCw size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>Réessayer</span>
      </button>
    </div>
  );
}
