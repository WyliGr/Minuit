export function ScheduleSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mn-skeleton-film">
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            <div
              className="mn-skeleton-line"
              style={{ width: 220 + i * 40, height: 24 }}
            />
            <div className="mn-skeleton-line" style={{ width: 80, height: 24 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div className="mn-skeleton-line" style={{ width: 130, height: 14 }} />
            <div className="mn-skeleton-line" style={{ width: 64, height: 28, borderRadius: 8 }} />
            <div className="mn-skeleton-line" style={{ width: 64, height: 28, borderRadius: 8 }} />
            <div className="mn-skeleton-line" style={{ width: 64, height: 28, borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="mn-skeleton-line" style={{ width: 130, height: 14 }} />
            <div className="mn-skeleton-line" style={{ width: 64, height: 28, borderRadius: 8 }} />
            <div className="mn-skeleton-line" style={{ width: 64, height: 28, borderRadius: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}