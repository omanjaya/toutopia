import { Card, CardContent } from "@/shared/components/ui/card";

function Skeleton({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  );
}

export default function PracticeLoading(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-14" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
