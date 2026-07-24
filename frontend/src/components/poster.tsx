import { useState } from 'react';

interface PosterProps {
  url: string | null;
  title: string;
  /** When provided and `url` is set, the poster becomes a button that
   *  opens the fullscreen modal. Without this, the poster is a static
   *  decorative image. */
  onOpen?: (url: string, title: string) => void;
}

function monogram(title: string): string {
  const cleaned = title.trim();
  if (!cleaned) return '·';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function Poster({ url, title, onOpen }: PosterProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !url || errored;
  const interactive = !!url && !errored && !!onOpen;

  const content = (
    <>
      {!showFallback && (
        <img
          className="mn-poster-img"
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
        />
      )}
      <span
        className="mn-poster-fallback"
        hidden={!showFallback}
        aria-hidden="true"
      >
        {monogram(title)}
      </span>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className="mn-poster"
        data-interactive="true"
        aria-label={title ? `Voir l'affiche de ${title} en grand` : "Voir l'affiche en grand"}
        onClick={() => onOpen(url!, title)}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="mn-poster"
      role="img"
      aria-label={title ? `Affiche : ${title}` : 'Affiche'}
    >
      {content}
    </div>
  );
}
