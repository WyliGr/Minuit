export function EmptyState() {
  return (
    <div className="mn-empty">
      <p className="mn-empty-title">Aucune séance</p>
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
    <div className="mn-error">
      <p className="mn-error-title">Impossible de charger les séances</p>
      <p className="mn-error-desc">{message}</p>
      <button className="mn-error-retry" onClick={onRetry}>
        Réessayer
      </button>
    </div>
  );
}