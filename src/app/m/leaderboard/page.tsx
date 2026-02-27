import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Medal, Trophy } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
};

interface LeaderboardPageProps {
  searchParams: Promise<{ pkg?: string }>;
}

export default async function MobileLeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;

  const packages = await prisma.examPackage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true },
  });

  const selectedPkgId = params.pkg ?? packages[0]?.id;

  let entries: Array<{
    id: string;
    score: number;
    rank: number | null;
    userId: string;
    user: { id: string; name: string; avatar: string | null };
  }> = [];

  let currentUserRank: number | null = null;

  if (selectedPkgId) {
    entries = await prisma.leaderboardEntry.findMany({
      where: { packageId: selectedPkgId },
      orderBy: { score: "desc" },
      take: 50,
      select: {
        id: true,
        score: true,
        rank: true,
        userId: true,
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const userEntry = entries.find((e) => e.userId === userId);
    if (userEntry) {
      const idx = entries.indexOf(userEntry);
      currentUserRank = idx + 1;
    }
  }

  const medalColors = [
    "bg-amber-100 text-amber-600",
    "bg-slate-100 text-slate-500",
    "bg-orange-100 text-orange-600",
  ];

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

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
        <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
      </div>

      {/* Package Pills */}
      {packages.length > 0 && (
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/m/leaderboard?pkg=${pkg.id}`}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedPkgId === pkg.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {pkg.title}
            </Link>
          ))}
        </div>
      )}

      {entries.length > 0 ? (
        <>
          {/* Top 3 Podium */}
          <div className="mb-6 flex items-end justify-center gap-3">
            {entries.slice(0, 3).map((entry, idx) => {
              const order = [1, 0, 2];
              const reordered = entries.slice(0, 3);
              const e = reordered[order[idx]];
              if (!e) return null;
              const rank = order[idx] + 1;
              const isFirst = rank === 1;

              return (
                <div
                  key={e.id}
                  className={cn(
                    "flex flex-col items-center",
                    isFirst ? "order-2" : rank === 2 ? "order-1" : "order-3",
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 flex items-center justify-center rounded-full font-bold",
                      isFirst ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm",
                      medalColors[rank - 1],
                    )}
                  >
                    {getInitials(e.user.name)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Medal
                      className={cn(
                        "h-4 w-4",
                        rank === 1
                          ? "text-amber-500"
                          : rank === 2
                            ? "text-slate-400"
                            : "text-orange-600",
                      )}
                    />
                    <span className="text-xs font-semibold">#{rank}</span>
                  </div>
                  <p className="mt-0.5 max-w-[80px] truncate text-center text-xs font-medium">
                    {e.user.name}
                    {e.userId === userId && (
                      <span className="text-primary"> (Anda)</span>
                    )}
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {Math.round(e.score)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Full Rankings List */}
          <Card className="border-0 shadow-sm">
            <CardContent className="divide-y p-0">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrentUser = entry.userId === userId;

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      isCurrentUser && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        rank <= 3
                          ? medalColors[rank - 1]
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {rank}
                    </span>

                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold",
                      )}
                    >
                      {getInitials(entry.user.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          isCurrentUser && "text-primary",
                        )}
                      >
                        {entry.user.name}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            Anda
                          </Badge>
                        )}
                      </p>
                    </div>

                    <span className="text-sm font-bold tabular-nums">
                      {Math.round(entry.score)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Current user rank summary */}
          {currentUserRank && (
            <div className="mt-4 rounded-xl bg-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">Peringkat Anda</p>
              <p className="text-2xl font-bold text-primary">
                #{currentUserRank}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Belum ada data leaderboard.
          </p>
        </div>
      )}
    </div>
  );
}
