const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cardCls}>
            <div className="px-6 pt-6 pb-2">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="p-6 pt-2">
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="p-6 pt-2">
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}
