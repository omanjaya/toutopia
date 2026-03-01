import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Trophy, Medal, UserX } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard Paket",
};

export default async function PackageLeaderboardPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;
  const session = await auth();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  const pkg = await prisma.examPackage.findUnique({
    where: { id: packageId },
    select: { id: true, title: true, category: { select: { name: true } } },
  });

  if (!pkg) notFound();

  const entries = await prisma.leaderboardEntry.findMany({
    where: { packageId },
    orderBy: { score: "desc" },
    take: 100,
    select: {
      id: true,
      userId: true,
      score: true,
      user: { select: { id: true, name: true, avatar: true } },
      attempt: {
        select: { totalCorrect: true, finishedAt: true },
      },
    },
  });

  // Find current user's entry — they may be outside top 100
  const currentUserRank = entries.findIndex(
    (e) => e.userId === currentUserId
  );
  // 0-indexed → 1-indexed, -1 means not in top 100
  const currentUserRankDisplay =
    currentUserRank !== -1 ? currentUserRank + 1 : null;

  // Check if current user has any leaderboard entry at all (even outside top 100)
  const currentUserEntry =
    currentUserId && currentUserRank === -1
      ? await prisma.leaderboardEntry.findUnique({
          where: {
            packageId_userId: { packageId, userId: currentUserId },
          },
          select: { score: true, rank: true },
        })
      : null;

  const medalColors = ["text-amber-500", "text-slate-400", "text-orange-600"];

  const hasCurrentUserInList = currentUserRankDisplay != null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/leaderboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">
            {pkg.title} &middot; {pkg.category.name}
          </p>
        </div>
      </div>

      {/* Current user rank banner — shown when user is in list */}
      {hasCurrentUserInList && currentUserRankDisplay != null && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Trophy className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">
              Peringkat kamu saat ini
            </p>
            <p className="text-xs text-muted-foreground">
              Kamu berada di posisi #{currentUserRankDisplay} dari {entries.length} peserta
            </p>
          </div>
          <span className="text-2xl font-bold text-primary tabular-nums">
            #{currentUserRankDisplay}
          </span>
        </div>
      )}

      {/* Current user rank banner — shown when user is outside top 100 */}
      {!hasCurrentUserInList && currentUserEntry && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Trophy className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">
              Kamu: #{currentUserEntry.rank ?? "di luar top 100"}
            </p>
            <p className="text-xs text-muted-foreground">
              Skor kamu: {Math.round(currentUserEntry.score)} — Terus berlatih
              untuk naik peringkat!
            </p>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {([1, 0, 2] as const).map((idx) => {
            const entry = entries[idx];
            if (!entry) return null;
            const rank = idx + 1;
            const isMe = entry.userId === currentUserId;

            return (
              <Card
                key={entry.id}
                className={cn(
                  "text-center",
                  rank === 1 &&
                    "border-amber-500 sm:col-start-2 sm:row-start-1",
                  isMe && "border-primary/30 bg-primary/5"
                )}
              >
                <CardContent className="pt-6">
                  <Trophy
                    className={cn(
                      "mx-auto mb-2 h-8 w-8",
                      medalColors[idx] ?? "text-muted-foreground"
                    )}
                  />
                  <p className="text-2xl font-bold">#{rank}</p>
                  <p className="font-medium truncate">
                    {entry.user.name ?? "Anonim"}
                  </p>
                  {isMe && (
                    <Badge variant="outline" className="mt-1 text-xs text-primary border-primary/30">
                      Kamu
                    </Badge>
                  )}
                  <p className="text-lg font-bold text-primary mt-1">
                    {Math.round(entry.score)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Peringkat Lengkap</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <UserX className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="font-medium">Belum ada peserta</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentUserId
                  ? "Kamu belum masuk leaderboard ini. Selesaikan paket untuk tampil di sini."
                  : "Belum ada peserta di leaderboard ini."}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((entry, idx) => {
                const isCurrentUser = entry.userId === currentUserId;

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isCurrentUser
                        ? "bg-primary/5 border border-primary/20 font-medium"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className="w-8 text-right font-mono shrink-0">
                      {idx < 3 ? (
                        <Medal
                          className={cn(
                            "inline h-4 w-4",
                            medalColors[idx] ?? "text-muted-foreground"
                          )}
                        />
                      ) : (
                        <span className={cn(isCurrentUser && "text-primary")}>
                          {idx + 1}
                        </span>
                      )}
                    </span>
                    <span className="flex-1 truncate">
                      {entry.user.name ?? "Anonim"}
                      {isCurrentUser && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs text-primary border-primary/30"
                        >
                          Kamu
                        </Badge>
                      )}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {entry.attempt.totalCorrect ?? "-"} benar
                    </span>
                    <span
                      className={cn(
                        "w-16 text-right font-bold tabular-nums shrink-0",
                        isCurrentUser && "text-primary"
                      )}
                    >
                      {Math.round(entry.score)}
                    </span>
                  </div>
                );
              })}

              {/* If user is outside top 100 and has an entry, show them below the list */}
              {!hasCurrentUserInList && currentUserEntry && (
                <>
                  <div className="my-2 flex items-center gap-2 px-3 text-xs text-muted-foreground">
                    <div className="flex-1 border-t border-dashed" />
                    <span>posisi kamu</span>
                    <div className="flex-1 border-t border-dashed" />
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium">
                    <span className="w-8 text-right font-mono shrink-0 text-primary">
                      {currentUserEntry.rank ?? "?"}
                    </span>
                    <span className="flex-1 truncate">
                      {session?.user?.name ?? "Kamu"}
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs text-primary border-primary/30"
                      >
                        Kamu
                      </Badge>
                    </span>
                    <span className="w-16 text-right font-bold tabular-nums text-primary shrink-0">
                      {Math.round(currentUserEntry.score)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
