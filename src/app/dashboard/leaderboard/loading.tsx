function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-4 h-5 w-80" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}
