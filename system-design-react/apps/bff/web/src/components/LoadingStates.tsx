export function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      <p className="loading-text">Searching flights, hotels, and weather...</p>
      <div className="skeleton-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card" data-testid="skeleton-card">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-body" />
            <div className="skeleton-line skeleton-body short" />
          </div>
        ))}
      </div>
    </div>
  );
}
