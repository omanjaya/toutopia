import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function PackageDetailLoading(): React.ReactElement {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="space-y-8">
          {/* Hero skeleton */}
          <div className="rounded-2xl bg-muted/20 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="mt-2 h-5 w-full max-w-xl" />
          </div>

          {/* Stats + Price card skeleton */}
          <div className="rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.05]">
            <div className="grid grid-cols-2 gap-4 border-b p-6 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div>
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="mt-1 h-7 w-28" />
                </div>
              </div>
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>

          {/* Features skeleton */}
          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/[0.05]">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-4.5 w-4.5 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </div>

          {/* Sections skeleton */}
          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/[0.05]">
            <Skeleton className="mb-4 h-6 w-36" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
