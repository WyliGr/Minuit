import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, Clock } from 'lucide-react';

interface ViewToggleProps {
  view: 'movie' | 'time';
  onChange: (view: 'movie' | 'time') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 2, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>(
      '[data-selected="true"]',
    );
    if (!active) return;
    setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, [view]);

  return (
    <div
      className="mn-view-toggle"
      ref={containerRef}
      role="tablist"
      aria-label="Mode d'affichage"
    >
      <span
        className="mn-view-toggle-indicator"
        style={{ left: indicator.left, width: indicator.width }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="mn-view-toggle-btn"
        data-selected={view === 'movie'}
        role="tab"
        aria-selected={view === 'movie'}
        onClick={() => onChange('movie')}
      >
        <LayoutGrid size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>Films</span>
      </button>
      <button
        type="button"
        className="mn-view-toggle-btn"
        data-selected={view === 'time'}
        role="tab"
        aria-selected={view === 'time'}
        onClick={() => onChange('time')}
      >
        <Clock size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>Horaire</span>
      </button>
    </div>
  );
}
