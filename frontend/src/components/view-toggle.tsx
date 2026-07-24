import { useEffect, useRef, useState } from 'react';

interface ViewToggleProps {
  view: string;
  onChange: (view: string) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 4, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>(
      '[data-selected="true"]',
    );
    if (!active) return;
    setIndicator({
      left: active.offsetLeft,
      width: active.offsetWidth,
    });
  }, [view]);

  return (
    <div className="mn-view-toggle" ref={containerRef}>
      <span
        className="mn-view-toggle-indicator"
        style={{ left: indicator.left, width: indicator.width }}
      />
      <button
        className="mn-view-toggle-btn"
        data-selected={view === 'movie'}
        onClick={() => onChange('movie')}
      >
        Par film
      </button>
      <button
        className="mn-view-toggle-btn"
        data-selected={view === 'time'}
        onClick={() => onChange('time')}
      >
        Par heure
      </button>
    </div>
  );
}