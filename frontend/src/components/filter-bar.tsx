import type { TheaterListItem } from '../lib/types';

interface FilterBarProps {
  theaters: TheaterListItem[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export function FilterBar({ theaters, selected, onChange }: FilterBarProps) {
  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    onChange(next);
  };

  const allSelected = selected.size === 0;

  return (
    <div className="mn-filters" role="group" aria-label="Salles">
      <button
        type="button"
        className="mn-theater-pill"
        data-selected={allSelected}
        onClick={() => onChange(new Set())}
      >
        Toutes
      </button>
      {theaters.map((t) => (
        <button
          key={t.slug}
          type="button"
          className="mn-theater-pill"
          data-selected={selected.has(t.slug)}
          aria-pressed={selected.has(t.slug)}
          onClick={() => toggle(t.slug)}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}
