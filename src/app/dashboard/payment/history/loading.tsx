import { Skeleton } from "@/shared/components/ui/skeleton";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export default function PaymentHistoryLoading(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Header + Credit Balance Stat Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className={`${cardCls} flex items-center gap-4 px-5 py-4`}>
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="ml-4 h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Pending Payments (optional section skeleton) */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full bg-amber-200" />
          <Skeleton className="h-4 w-40 bg-amber-200" />
          <Skeleton className="h-5 w-6 rounded-full bg-amber-200" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/80 px-4 py-3 ring-1 ring-amber-200"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Credit History Card */}
      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Card */}
      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="p-6">
          <div className="rounded-lg border">
            {/* Table header row (7 columns) */}
            <div className="flex gap-4 border-b px-4 py-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {/* Table body rows (7 columns each) */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 border-b px-4 py-3 last:border-b-0"
              >
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
