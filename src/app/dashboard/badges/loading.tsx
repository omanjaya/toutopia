import { Skeleton } from "@/shared/components/ui/skeleton";

export default function BadgesLoading(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* XP Card skeleton */}
      <Skeleton className="h-28 w-full rounded-xl" />

      {/* Badge grid skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
