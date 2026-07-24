import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';

/** No showtimes match the current filters. */
export function NoShowtimesEmpty() {
  return (
    <EmptyState
      title="Aucune séance"
      description="Aucun film ne passe dans les salles sélectionnées ce jour. Essayez un autre jour ou élargissez les filtres."
    />
  );
}

/** Fetch error for a specific day. */
export function DayError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Banner
      status="error"
      title="Impossible de charger les séances"
      description={message}
      container="section"
      endContent={
        <Button variant="secondary" size="sm" onClick={onRetry} label="Réessayer" />
      }
    />
  );
}

/** Theater list fetch error. */
export function TheatersError({ onRetry }: { onRetry: () => void }) {
  return (
    <Banner
      status="error"
      title="Salles indisponibles"
      description="La liste des salles n'a pas pu être chargée depuis le serveur."
      container="section"
      endContent={
        <Button variant="secondary" size="sm" onClick={onRetry} label="Réessayer" />
      }
    />
  );
}