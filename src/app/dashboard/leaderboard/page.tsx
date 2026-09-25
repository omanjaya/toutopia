import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Trophy, Medal, Users } from "lucide-react";
import { SegmentedNav } from "../history/segmented-nav";
import { cn } from "@/shared/lib/utils";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
};

const medalColors = ["text-amber-500", "text-slate-400", "text-orange-600"];
const medalBg = ["bg-amber-500/10", "bg-slate-400/10", "bg-orange-600/10"];

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await auth();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  const params = await searchParams;
  const categoryFilter = params.category ?? "all";

  // Fetch all categories that have published packages
  const categories = await prisma.examCategory.findMany({
    where: {
      packages: { some: { status: "PUBLISHED" } },
    },
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });

  const packages = await prisma.examPackage.findMany({
    where: {
      status: "PUBLISHED",
      ...(categoryFilter !== "all"
        ? { category: { name: categoryFilter } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: { select: { name: true } },
      _count: { select: { leaderboard: true } },
    },
  });

  const packageIds = packages.map((p) => p.id);

  // Single query instead of N queries — fetch all top entries for all packages at once
  const allTopEntries = await prisma.leaderboardEntry.findMany({
    where: { packageId: { in: packageIds } },
    orderBy: [{ packageId: "asc" }, { score: "desc" }],
    select: {
      id: true,
      packageId: true,
      userId: true,
      score: true,
      user: { select: { id: true, name: true } },
    },
  });

  // Group by packageId in JS, keep top 3 per package, and find current user's rank
  const entriesByPackage = new Map<
    string,
    { id: string; userId: string; score: number; user: { id: string; name: string | null } }[]
  >();
  const userRankByPackage = new Map<string, number>();

  for (const entry of allTopEntries) {
    const list = entriesByPackage.get(entry.packageId) ?? [];
    list.push(entry);
    entriesByPackage.set(entry.packageId, list);
  }

  // For each package: list is already sorted desc by score (from DB orderBy)
  // Compute user rank and slice to top 3
  for (const [pkgId, list] of entriesByPackage.entries()) {
    if (currentUserId) {
      const rankIdx = list.findIndex((e) => e.userId === currentUserId);
      if (rankIdx !== -1) {
        userRankByPackage.set(pkgId, rankIdx + 1);
      }
    }
    // Keep only top 3 for display
    entriesByPackage.set(pkgId, list.slice(0, 3));
  }

  const categoryOptions = [
    { value: "all", label: "Semua" },
    ...categories.map((c) => ({ value: c.name, label: c.name })),
  ];

  return (
    <div className="space-y-5 pb-20 md:pb-0 md:space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 md:text-2xl">
          <Trophy className="h-5 w-5 md:h-6 md:w-6" />
          Leaderboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Peringkat peserta terbaik di setiap paket try out
        </p>
      </div>

      {/* Category filter: scrollable pills on mobile, segmented nav on desktop */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:overflow-visible md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:[scrollbar-width:auto]">
        <div className="hidden md:block w-full">
          <SegmentedNav
            options={categoryOptions}
            value={categoryFilter}
            baseHref="/dashboard/leaderboard"
            paramKey="category"
          />
        </div>
        <div className="flex gap-2 md:hidden">
          {categoryOptions.map((opt) => (
            <Link
              key={opt.value}
              href={
                opt.value === "all"
                  ? "/dashboard/leaderboard"
                  : `/dashboard/leaderboard?category=${opt.value}`
              }
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                categoryFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Package cards: full-width list on mobile, grid on desktop */}
      {packages.length > 0 ? (
        <>
          {/* Mobile: stacked list with avatar initials for top 3 */}
          <div className="space-y-3 md:hidden">
            {packages.map((pkg) => {
              const top = entriesByPackage.get(pkg.id) ?? [];
              const userRank = userRankByPackage.get(pkg.id);

              return (
                <Link key={pkg.id} href={`/dashboard/leaderboard/${pkg.id}`}>
                  <div className={cn(cardCls, "transition-colors active:bg-muted/30")}>
                    <div className="px-4 pt-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Badge variant="outline" className="mb-1 text-[10px]">
                            {pkg.category.name}
                          </Badge>
                          <h3 className="text-sm font-semibold leading-snug tracking-tight">
                            {pkg.title}
                          </h3>
                        </div>
                        {userRank != null && (
                          <Badge className="shrink-0 text-[10px] text-primary border-primary/20">
                            Kamu: #{userRank}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {pkg._count.leaderboard} peserta
                      </p>
                    </div>
                    <div className="px-4 pb-4">
                      {top.length > 0 ? (
                        <div className="mt-2 space-y-1.5">
                          {top.map((entry, idx) => {
                            const isMe = entry.userId === currentUserId;
                            return (
                              <div
                                key={entry.id}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5",
                                  idx === 0 && "bg-amber-500/5",
                                  isMe && "font-semibold"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                    medalBg[idx] ?? "bg-muted",
                                    medalColors[idx] ?? "text-muted-foreground"
                                  )}
                                >
                                  {getInitials(entry.user.name)}
                                </div>
                                <Medal
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    medalColors[idx] ?? "text-muted-foreground"
                                  )}
                                />
                                <span className="flex-1 truncate text-sm">
                                  {entry.user.name ?? "Anonim"}
                                  {isMe && (
                                    <span className="ml-1 text-xs text-primary">(Kamu)</span>
                                  )}
                                </span>
                                <span className="shrink-0 text-sm font-bold tabular-nums">
                                  {Math.round(entry.score)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">Belum ada peserta</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop: grid cards */}
          <div className="hidden md:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
              const top = entriesByPackage.get(pkg.id) ?? [];
              const userRank = userRankByPackage.get(pkg.id);

              return (
                <Link key={pkg.id} href={`/dashboard/leaderboard/${pkg.id}`}>
                  <div className={`${cardCls} hover:ring-primary/50 hover:shadow-md transition-all h-full`}>
                    <div className="px-6 pt-6 pb-2">
                      <Badge variant="outline" className="w-fit mb-1">
                        {pkg.category.name}
                      </Badge>
                      <h3 className="text-base font-semibold tracking-tight leading-snug">
                        {pkg.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {pkg._count.leaderboard} peserta
                        </p>
                        {userRank != null && (
                          <Badge className="text-xs text-primary border-primary/20">
                            Kamu: #{userRank}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      {top.length > 0 ? (
                        <div className="space-y-2">
                          {top.map((entry, idx) => (
                            <div
                              key={entry.id}
                              className={cn(
                                "flex items-center gap-2 text-sm",
                                entry.userId === currentUserId && "font-semibold"
                              )}
                            >
                              <Medal
                                className={`h-4 w-4 ${medalColors[idx] ?? "text-muted-foreground"}`}
                              />
                              <span className="flex-1 truncate">
                                {entry.user.name ?? "Anonim"}
                                {entry.userId === currentUserId && (
                                  <span className="ml-1 text-xs text-primary">(Kamu)</span>
                                )}
                              </span>
                              <span className="font-semibold tabular-nums">
                                {Math.round(entry.score)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Belum ada peserta</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">
          Belum ada paket try out untuk kategori ini.
        </div>
      )}
    </div>
  );
}
