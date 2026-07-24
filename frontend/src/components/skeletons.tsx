interface ScheduleSkeletonProps {
  view: 'movie' | 'time';
}

export function ScheduleSkeleton({ view }: ScheduleSkeletonProps) {
  if (view === 'time') {
    return (
      <div aria-hidden="true">
        <header className="mn-section-head">
          <span
            className="mn-skel mn-skel-bar"
            style={{ width: 180, height: 12 }}
          />
          <span
            className="mn-skel mn-skel-bar"
            style={{ width: 60, height: 12 }}
          />
        </header>
        {Array.from({ length: 3 }).map((_, bucket) => (
          <div key={bucket} className="mn-skel-film">
            <div
              className="mn-skel mn-skel-bar"
              style={{ width: 64, height: 24, marginBottom: 12 }}
            />
            {Array.from({ length: 3 }).map((__, row) => (
              <div
                key={row}
                className="mn-skel mn-skel-bar"
                style={{
                  width: `${88 - row * 6}%`,
                  height: 18,
                  marginTop: 12,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden="true">
      <header className="mn-section-head">
        <span
          className="mn-skel mn-skel-bar"
          style={{ width: 180, height: 12 }}
        />
        <span
          className="mn-skel mn-skel-bar"
          style={{ width: 60, height: 12 }}
        />
      </header>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mn-skel-film">
          <div
            className="mn-skel mn-skel-bar"
            style={{ width: `${45 + i * 5}%`, height: 22 }}
          />
          <div
            className="mn-skel mn-skel-bar"
            style={{ width: 160, height: 12, marginTop: 8 }}
          />
          <div
            className="mn-skel mn-skel-bar"
            style={{ width: 220, height: 18, marginTop: 16 }}
          />
        </div>
      ))}
    </div>
  );
}
