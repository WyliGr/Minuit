interface ViewToggleProps {
  view: string;
  onChange: (view: string) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="minuit-view-toggle">
      <button
        className="minuit-view-toggle-btn"
        data-selected={view === 'movie'}
        onClick={() => onChange('movie')}
      >
        Par film
      </button>
      <button
        className="minuit-view-toggle-btn"
        data-selected={view === 'time'}
        onClick={() => onChange('time')}
      >
        Par heure
      </button>
    </div>
  );
}