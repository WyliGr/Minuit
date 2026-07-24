export function ScheduleSkeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mn-skeleton-film">
          <div
            className="mn-skeleton-line"
            style={{ width: 70, height: 12, marginBottom: 14 }}
          />
          <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
            <div
              className="mn-skeleton-line"
              style={{ width: 240 + i * 50, height: 34 }}
            />
            <div
              className="mn-skeleton-line"
              style={{ width: 70, height: 20, marginTop: 7 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div
              className="mn-skeleton-line"
              style={{ width: 130, height: 12 }}
            />
            <div
              className="mn-skeleton-line"
              style={{ width: 56, height: 28, borderRadius: 8 }}
            />
            <div
              className="mn-skeleton-line"
              style={{ width: 56, height: 28, borderRadius: 8 }}
            />
            <div
              className="mn-skeleton-line"
              style={{ width: 56, height: 28, borderRadius: 8 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              className="mn-skeleton-line"
              style={{ width: 130, height: 12 }}
            />
            <div
              className="mn-skeleton-line"
              style={{ width: 56, height: 28, borderRadius: 8 }}
            />
            <div
              className="mn-skeleton-line"
              style={{ width: 56, height: 28, borderRadius: 8 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}