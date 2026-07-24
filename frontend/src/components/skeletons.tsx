export function ScheduleSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="minuit-skeleton-film">
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-3, 12px)',
              marginBottom: 'var(--spacing-4, 16px)',
            }}
          >
            <div
              className="minuit-skeleton-line"
              style={{ width: 220 + i * 40, height: 20 }}
            />
            <div
              className="minuit-skeleton-line"
              style={{ width: 80, height: 20 }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-2, 8px)',
              marginBottom: 'var(--spacing-2, 8px)',
            }}
          >
            <div
              className="minuit-skeleton-line"
              style={{ width: 120, height: 14 }}
            />
            <div
              className="minuit-skeleton-line"
              style={{ width: 56, height: 24, borderRadius: 8 }}
            />
            <div
              className="minuit-skeleton-line"
              style={{ width: 56, height: 24, borderRadius: 8 }}
            />
            <div
              className="minuit-skeleton-line"
              style={{ width: 56, height: 24, borderRadius: 8 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-2, 8px)' }}>
            <div
              className="minuit-skeleton-line"
              style={{ width: 120, height: 14 }}
            />
            <div
              className="minuit-skeleton-line"
              style={{ width: 56, height: 24, borderRadius: 8 }}
            />
            <div
              className="minuit-skeleton-line"
              style={{ width: 56, height: 24, borderRadius: 8 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}