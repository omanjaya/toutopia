import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Trophy, Medal, Users } from "lucide-react";
import { SegmentedNav } from "../history/segmented-nav";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
};

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

  const medalColors = ["text-amber-500", "text-slate-400", "text-orange-600"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Leaderboard
        </h2>
        <p className="text-muted-foreground">
          Peringkat peserta terbaik di setiap paket try out
        </p>
      </div>

      <SegmentedNav
        options={categoryOptions}
        value={categoryFilter}
        baseHref="/dashboard/leaderboard"
        paramKey="category"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const top = entriesByPackage.get(pkg.id) ?? [];
          const userRank = userRankByPackage.get(pkg.id);

          return (
            <Link key={pkg.id} href={`/dashboard/leaderboard/${pkg.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all h-full">
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="w-fit mb-1">
                    {pkg.category.name}
                  </Badge>
                  <CardTitle className="text-base leading-snug">
                    {pkg.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {pkg._count.leaderboard} peserta
                    </p>
                    {userRank != null && (
                      <Badge
                        variant="secondary"
                        className="text-xs text-primary border-primary/20"
                      >
                        Kamu: #{userRank}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
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
                              <span className="ml-1 text-xs text-primary">
                                (Kamu)
                              </span>
                            )}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {Math.round(entry.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada peserta
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {packages.length === 0 && (
          <div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">
            Belum ada paket try out untuk kategori ini.
          </div>
        )}
      </div>
    </div>
  );
}
