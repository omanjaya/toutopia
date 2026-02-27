function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function MobileAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="mb-5 h-10 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border p-4">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-48 w-full rounded" />
      </div>
    </div>
  );
}
