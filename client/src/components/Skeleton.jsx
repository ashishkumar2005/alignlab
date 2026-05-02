export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function CardSkeleton({ rows = 4 }) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <Skeleton className="mb-5 h-5 w-1/3" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
