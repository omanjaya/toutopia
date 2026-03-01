import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
import { TryoutFilterBar } from "./tryout-filter-bar";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog Try Out",
  description: "Pilih paket try out UTBK, CPNS, BUMN, PPPK, dan Kedinasan untuk mulai latihan.",
};

// Color accent on the left border based on exam category name
function getCategoryAccent(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes("utbk") || lower.includes("snbt")) return "border-l-blue-500";
  if (lower.includes("cpns")) return "border-l-emerald-500";
  if (lower.includes("bumn")) return "border-l-amber-500";
  if (lower.includes("pppk")) return "border-l-purple-500";
  if (lower.includes("kedinasan") || lower.includes("ipdn") || lower.includes("stan"))
    return "border-l-orange-500";
  return "border-l-slate-400";
}

function getCategoryDotColor(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes("utbk") || lower.includes("snbt")) return "bg-blue-500";
  if (lower.includes("cpns")) return "bg-emerald-500";
  if (lower.includes("bumn")) return "bg-amber-500";
  if (lower.includes("pppk")) return "bg-purple-500";
  if (lower.includes("kedinasan") || lower.includes("ipdn") || lower.includes("stan"))
    return "bg-orange-500";
  return "bg-slate-400";
}

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function TryOutCatalogPage({ searchParams }: PageProps) {
  const session = await auth();
  const { q, category, sort } = await searchParams;

  // Fetch active categories for the filter bar
  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Build where clause based on URL params
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

  // Resolve sort into Prisma orderBy
  let orderBy: Prisma.ExamPackageOrderByWithRelationInput | Prisma.ExamPackageOrderByWithRelationInput[];
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
      // "terbaru"
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

  // Fetch user's attempts for showing per-package status
  const userAttempts =
    session?.user?.id
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Katalog Try Out</h2>
        <p className="text-muted-foreground">
          Pilih paket try out untuk mulai latihan
        </p>
      </div>

      {/* Filter bar — client component */}
      <TryoutFilterBar
        categories={categories}
        currentQ={q ?? ""}
        currentCategory={category ?? ""}
        currentSort={sort ?? ""}
      />

      {/* Results count */}
      {packages.length > 0 && (
        <p className="text-sm text-muted-foreground">
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

      {/* Package grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const attempts = attemptsByPackage.get(pkg.id) ?? [];
          const inProgress = attempts.find((a) => a.status === "IN_PROGRESS");
          const completedAttempts = attempts.filter(
            (a) => a.status === "COMPLETED" || a.status === "TIMED_OUT",
          );
          const bestScore = completedAttempts
            .filter((a) => a.score !== null)
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]?.score ?? null;

          const accentClass = getCategoryAccent(pkg.category.name);
          const dotColorClass = getCategoryDotColor(pkg.category.name);
          const attemptCount = attempts.length;
          const maxReached = attemptCount >= pkg.maxAttempts;

          return (
            <div
              key={pkg.id}
              className={cn(
                cardCls,
                "flex flex-col border-l-4 transition-shadow hover:shadow-md",
                accentClass,
              )}
            >
              <div className="px-6 pt-6 pb-2">
                {/* Top row: category badge + price */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", dotColorClass)} />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {pkg.category.name}
                    </span>
                  </div>
                  {pkg.isFree ? (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 border-emerald-200"
                    >
                      Gratis
                    </Badge>
                  ) : (
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(pkg.discountPrice ?? pkg.price)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-2 text-base font-semibold leading-snug line-clamp-2">
                  {pkg.title}
                </h3>

                {/* Description */}
                {pkg.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {pkg.description}
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-3 p-6 pt-0">
                {/* Stats row */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {pkg.totalQuestions} soal
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {pkg.durationMinutes} menit
                  </span>
                </div>

                {/* Section pills */}
                {pkg.sections.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.sections.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground bg-muted/40"
                        title={`${s.totalQuestions} soal, ${s.durationMinutes} menit`}
                      >
                        {s.title}
                      </span>
                    ))}
                  </div>
                )}

                {/* User attempt badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      attemptCount > 0 ? "text-blue-600" : "text-muted-foreground",
                    )}
                  >
                    {attemptCount === 0
                      ? "Belum dicoba"
                      : `${attemptCount}x dicoba`}
                  </span>
                  {/* Global participant count */}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {pkg._count.attempts.toLocaleString("id-ID")} peserta
                  </span>
                </div>

                {/* Score trend — only when user has completed attempts */}
                {bestScore !== null && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Skor terbaik</span>
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

                {/* CTA button */}
                <div className="pt-1">
                  {inProgress ? (
                    <Button asChild className="w-full" size="sm">
                      <Link href={`/exam/${inProgress.id}`}>
                        Lanjutkan Ujian
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : maxReached ? (
                    <Button asChild className="w-full" size="sm" variant="outline">
                      <Link href={`/dashboard/tryout/${pkg.id}`}>
                        Lihat Hasil
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full" size="sm">
                      <Link href={`/dashboard/tryout/${pkg.id}`}>
                        Mulai Try Out
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {packages.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-base font-medium text-muted-foreground">
              {q || category
                ? "Tidak ada paket yang cocok dengan filter"
                : "Belum ada paket try out yang tersedia"}
            </p>
            {(q || category) && (
              <p className="mt-1 text-sm text-muted-foreground">
                Coba ubah kata kunci pencarian atau pilih kategori lain
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
