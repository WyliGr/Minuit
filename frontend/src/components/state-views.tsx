export function EmptyState() {
  return (
    <div className="minuit-empty">
      <p className="minuit-empty-title">Aucune séance</p>
      <p className="minuit-empty-desc">
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
    <div className="minuit-error">
      <p className="minuit-error-title">Impossible de charger les séances</p>
      <p className="minuit-error-desc">{message}</p>
      <button className="minuit-error-retry" onClick={onRetry}>
        Réessayer
      </button>
    </div>
  );
}