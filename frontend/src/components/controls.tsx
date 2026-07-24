import { DayStrip } from './day-strip';
import { FilterBar } from './filter-bar';
import { ViewToggle } from './view-toggle';
import type { TheaterListItem } from '../lib/types';
import type { DaySchedule, LoadStatus } from '../lib/use-schedule';

interface ControlsProps {
  day: DaySchedule | null;
  selectedDay: number;
  onSelectDay: (n: number) => void;
  maxOffset: number;
  theaters: TheaterListItem[];
  theatersStatus: LoadStatus;
  selectedSlugs: Set<string>;
  onChangeSlugs: (s: Set<string>) => void;
  view: 'movie' | 'time';
  onChangeView: (v: 'movie' | 'time') => void;
}

export function Controls({
  selectedDay,
  onSelectDay,
  maxOffset,
  theaters,
  theatersStatus,
  selectedSlugs,
  onChangeSlugs,
  view,
  onChangeView,
}: ControlsProps) {
  return (
    <div className="mn-island">
      <div className="mn-container">
        <div className="mn-island-row mn-island-row-primary">
          <DayStrip
            selectedDay={selectedDay}
            onSelect={onSelectDay}
            maxOffset={maxOffset}
          />
          <ViewToggle view={view} onChange={onChangeView} />
        </div>
        <div className="mn-island-row mn-island-row-secondary">
          {theatersStatus === 'loading' ? (
            <div
              className="mn-skel mn-skel-bar"
              style={{ width: 240, height: 16 }}
              aria-hidden="true"
            />
          ) : (
            <FilterBar
              theaters={theaters}
              selected={selectedSlugs}
              onChange={onChangeSlugs}
            />
          )}
        </div>
      </div>
    </div>
  );
}
