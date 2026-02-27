function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function MobilePracticeLoading() {
  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>
      </div>
      <div className="rounded-lg border p-4 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
