import { useState } from 'react';

interface PosterProps {
  url: string | null;
  title: string;
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

export function Poster({ url, title }: PosterProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !url || errored;

  return (
    <div
      className="mn-poster"
      role="img"
      aria-label={title ? `Affiche : ${title}` : 'Affiche'}
    >
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
    </div>
  );
}
