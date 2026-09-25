import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import {
  Clock,
  FileText,
  ArrowRight,
  Users,
  PackageOpen,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { formatCurrency, cn } from "@/shared/lib/utils";
import { MobileTryoutFilters } from "./tryout-filters-mobile";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog Try Out",
  description:
    "Pilih paket try out UTBK, CPNS, BUMN, PPPK, dan Kedinasan untuk mulai latihan.",
};

function getCategoryAccent(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes("utbk") || lower.includes("snbt"))
    return "border-l-blue-500";
  if (lower.includes("cpns")) return "border-l-emerald-500";
  if (lower.includes("bumn")) return "border-l-amber-500";
  if (lower.includes("pppk")) return "border-l-purple-500";
  if (
    lower.includes("kedinasan") ||
    lower.includes("ipdn") ||
    lower.includes("stan")
  )
    return "border-l-orange-500";
  return "border-l-slate-400";
}

function getCategoryDotColor(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes("utbk") || lower.includes("snbt")) return "bg-blue-500";
  if (lower.includes("cpns")) return "bg-emerald-500";
  if (lower.includes("bumn")) return "bg-amber-500";
  if (lower.includes("pppk")) return "bg-purple-500";
  if (
    lower.includes("kedinasan") ||
    lower.includes("ipdn") ||
    lower.includes("stan")
  )
    return "bg-orange-500";
  return "bg-slate-400";
}

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function MobileTryoutPage({ searchParams }: PageProps) {
  const session = await auth();
  const { q, category, sort } = await searchParams;

  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const where: Prisma.ExamPackageWhereInput = {
    status: "PUBLISHED",
  };

  if (q && q.trim().length > 0) {
    where.title = { contains: q.trim(), mode: "insensitive" };
  }

  if (category) {
    const matchedCategory = categories.find((c) => c.slug === category);
    if (matchedCategory) {
      where.categoryId = matchedCategory.id;
    }
  }

  let orderBy:
    | Prisma.ExamPackageOrderByWithRelationInput
    | Prisma.ExamPackageOrderByWithRelationInput[];
  switch (sort) {
    case "populer":
      orderBy = [{ attempts: { _count: "desc" } }, { createdAt: "desc" }];
      break;
    case "gratis":
      orderBy = [{ isFree: "desc" }, { createdAt: "desc" }];
      break;
    case "berbayar":
      orderBy = [{ isFree: "asc" }, { price: "desc" }];
      break;
    default:
      orderBy = [{ createdAt: "desc" }];
      break;
  }

  const packages = await prisma.examPackage.findMany({
    where,
    orderBy,
    include: {
      category: { select: { id: true, name: true } },
      sections: {
        orderBy: { order: "asc" },
        select: { title: true, totalQuestions: true, durationMinutes: true },
      },
      _count: { select: { attempts: true } },
    },
  });

  const userAttempts = session?.user?.id
    ? await prisma.examAttempt.findMany({
        where: { userId: session.user.id },
        select: { id: true, packageId: true, status: true, score: true },
      })
    : [];

  const attemptsByPackage = new Map<
    string,
    { id: string; status: string; score: number | null }[]
  >();
  for (const a of userAttempts) {
    const list = attemptsByPackage.get(a.packageId) ?? [];
    list.push({ id: a.id, status: a.status, score: a.score });
    attemptsByPackage.set(a.packageId, list);
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">
          Katalog Try Out
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih paket try out untuk mulai latihan
        </p>
      </div>

      {/* Filter pills — client component */}
      <MobileTryoutFilters
        categories={categories}
        currentQ={q ?? ""}
        currentCategory={category ?? ""}
        currentSort={sort ?? ""}
      />

      {/* Results count */}
      {packages.length > 0 && (
        <p className="mb-3 text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-medium text-foreground">{packages.length}</span>{" "}
          paket
          {q ? (
            <>
              {" "}
              untuk{" "}
              <span className="font-medium text-foreground">
                &ldquo;{q}&rdquo;
              </span>
            </>
          ) : null}
        </p>
      )}

      {/* Package list */}
      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <PackageOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold">
            {q || category
              ? "Tidak ada paket yang cocok"
              : "Belum ada paket tersedia"}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {q || category
              ? "Coba ubah kata kunci pencarian atau pilih kategori lain."
              : "Paket try out akan segera tersedia."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const attempts = attemptsByPackage.get(pkg.id) ?? [];
            const inProgress = attempts.find((a) => a.status === "IN_PROGRESS");
            const completedAttempts = attempts.filter(
              (a) => a.status === "COMPLETED" || a.status === "TIMED_OUT",
            );
            const bestScore =
              completedAttempts
                .filter((a) => a.score !== null)
                .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]?.score ??
              null;

            const accentClass = getCategoryAccent(pkg.category.name);
            const dotColorClass = getCategoryDotColor(pkg.category.name);
            const attemptCount = attempts.length;
            const maxReached = attemptCount >= pkg.maxAttempts;

            const href = inProgress
              ? `/exam/${inProgress.id}`
              : `/m/dashboard/tryout/${pkg.id}`;

            return (
              <Link key={pkg.id} href={href} className="block">
                <div
                  className={cn(
                    cardCls,
                    "flex flex-col border-l-4 active:scale-[0.98] transition-transform",
                    accentClass,
                  )}
                >
                  <div className="p-4">
                    {/* Top row: category dot + name + price/badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            dotColorClass,
                          )}
                        />
                        <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {pkg.category.name}
                        </span>
                      </div>
                      {pkg.isFree ? (
                        <Badge
                          variant="secondary"
                          className="shrink-0 border-emerald-200 bg-emerald-100 text-emerald-700"
                        >
                          Gratis
                        </Badge>
                      ) : (
                        <span className="shrink-0 text-sm font-semibold text-foreground">
                          {formatCurrency(pkg.discountPrice ?? pkg.price)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="mt-2 text-sm font-semibold leading-snug line-clamp-2">
                      {pkg.title}
                    </h2>

                    {/* Description */}
                    {pkg.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {pkg.description}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="mt-2.5 flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {pkg.totalQuestions} soal
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {pkg.durationMinutes} menit
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {pkg._count.attempts.toLocaleString("id-ID")} peserta
                      </span>
                    </div>

                    {/* Section pills */}
                    {pkg.sections.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {pkg.sections.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-full border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                            title={`${s.totalQuestions} soal, ${s.durationMinutes} menit`}
                          >
                            {s.title}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Best score progress */}
                    {bestScore !== null && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Skor terbaik
                          </span>
                          <span
                            className={cn(
                              "font-semibold",
                              bestScore >= 700
                                ? "text-emerald-600"
                                : bestScore >= 500
                                  ? "text-amber-600"
                                  : "text-red-500",
                            )}
                          >
                            {Math.round(bestScore)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(100, (bestScore / 1000) * 100)}
                          className="h-1.5"
                        />
                      </div>
                    )}

                    {/* Footer: attempt count + CTA */}
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          attemptCount > 0
                            ? "text-blue-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {attemptCount === 0
                          ? "Belum dicoba"
                          : `${attemptCount}x dicoba`}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        {inProgress
                          ? "Lanjutkan"
                          : maxReached
                            ? "Lihat Hasil"
                            : "Mulai"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
