interface DayStripProps {
  selectedDay: number;
  onSelect: (day: number) => void;
  maxOffset: number;
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export function DayStrip({ selectedDay, onSelect, maxOffset }: DayStripProps) {
  const today = new Date();

  const days = Array.from({ length: maxOffset + 1 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      offset: i,
      dayName: DAYS_FR[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
      isTomorrow: i === 1,
    };
  });

  return (
    <div className="mn-day-strip" role="tablist" aria-label="Jour">
      {days.map((d) => (
        <button
          key={d.offset}
          className="mn-day-chip"
          data-selected={d.offset === selectedDay}
          role="tab"
          aria-selected={d.offset === selectedDay}
          onClick={() => onSelect(d.offset)}
        >
          <span className="mn-day-chip-label">
            {d.isToday ? "Auj" : d.isTomorrow ? "Dem" : d.dayName}
          </span>
          <span className="mn-day-chip-day">{d.dayNum}</span>
        </button>
      ))}
    </div>
  );
}
