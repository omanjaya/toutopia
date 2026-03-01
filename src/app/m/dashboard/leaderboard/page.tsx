import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Users, UserX } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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

export default async function MobileLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const currentUserId = (session.user as { id: string }).id;

  const params = await searchParams;
  const categoryFilter = params.category ?? "all";

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

  const entriesByPackage = new Map<
    string,
    {
      id: string;
      userId: string;
      score: number;
      user: { id: string; name: string | null };
    }[]
  >();
  const userRankByPackage = new Map<string, number>();

  for (const entry of allTopEntries) {
    const list = entriesByPackage.get(entry.packageId) ?? [];
    list.push(entry);
    entriesByPackage.set(entry.packageId, list);
  }

  for (const [pkgId, list] of entriesByPackage.entries()) {
    const rankIdx = list.findIndex((e) => e.userId === currentUserId);
    if (rankIdx !== -1) {
      userRankByPackage.set(pkgId, rankIdx + 1);
    }
    entriesByPackage.set(pkgId, list.slice(0, 3));
  }

  const categoryOptions = [
    { value: "all", label: "Semua" },
    ...categories.map((c) => ({ value: c.name, label: c.name })),
  ];

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Peringkat peserta terbaik di setiap paket
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryOptions.map((opt) => (
          <Link
            key={opt.value}
            href={
              opt.value === "all"
                ? "/m/dashboard/leaderboard"
                : `/m/dashboard/leaderboard?category=${opt.value}`
            }
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              categoryFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Package Leaderboard Cards */}
      {packages.length > 0 ? (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const top = entriesByPackage.get(pkg.id) ?? [];
            const userRank = userRankByPackage.get(pkg.id);

            return (
              <Link key={pkg.id} href={`/m/dashboard/leaderboard/${pkg.id}`}>
                <div
                  className={cn(
                    cardCls,
                    "transition-colors active:bg-muted/30",
                  )}
                >
                  {/* Card Header */}
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

                  {/* Top 3 rows */}
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
                                isMe && "font-semibold",
                              )}
                            >
                              {/* Avatar / Initials */}
                              <div
                                className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                  medalBg[idx] ?? "bg-muted",
                                  medalColors[idx] ?? "text-muted-foreground",
                                )}
                              >
                                {getInitials(entry.user.name)}
                              </div>

                              {/* Rank medal */}
                              <Medal
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0",
                                  medalColors[idx] ?? "text-muted-foreground",
                                )}
                              />

                              {/* Name */}
                              <span className="flex-1 truncate text-sm">
                                {entry.user.name ?? "Anonim"}
                                {isMe && (
                                  <span className="ml-1 text-xs text-primary">
                                    (Kamu)
                                  </span>
                                )}
                              </span>

                              {/* Score */}
                              <span className="shrink-0 text-sm font-bold tabular-nums">
                                {Math.round(entry.score)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Belum ada peserta
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <UserX className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold">Belum ada paket</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Belum ada paket try out untuk kategori ini.
          </p>
        </div>
      )}
    </div>
  );
}
