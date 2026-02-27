function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function MobileBookmarksLoading() {
  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-6 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2.5">
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
