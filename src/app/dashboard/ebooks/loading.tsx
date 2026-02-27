import { Card, CardContent } from "@/shared/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function EbooksLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-4 h-5 w-80" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardContent className="pt-4">
              <div className="mb-2 flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3" />
              <Skeleton className="mt-3 h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
