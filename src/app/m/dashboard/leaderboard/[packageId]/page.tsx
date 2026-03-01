import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Trophy, Medal, UserX } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard Paket",
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

export default async function MobilePackageLeaderboardPage({
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

  const currentUserRank = entries.findIndex((e) => e.userId === currentUserId);
  const currentUserRankDisplay =
    currentUserRank !== -1 ? currentUserRank + 1 : null;

  const currentUserEntry =
    currentUserId && currentUserRank === -1
      ? await prisma.leaderboardEntry.findUnique({
          where: {
            packageId_userId: { packageId, userId: currentUserId },
          },
          select: { score: true, rank: true },
        })
      : null;

  const hasCurrentUserInList = currentUserRankDisplay != null;

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard/leaderboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="truncate text-xs text-muted-foreground">
            {pkg.title} &middot; {pkg.category.name}
          </p>
        </div>
      </div>

      {/* Current user rank banner — in top 100 */}
      {hasCurrentUserInList && currentUserRankDisplay != null && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Trophy className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">
              Peringkat kamu saat ini
            </p>
            <p className="text-xs text-muted-foreground">
              #{currentUserRankDisplay} dari {entries.length} peserta
            </p>
          </div>
          <span className="text-2xl font-bold tabular-nums text-primary">
            #{currentUserRankDisplay}
          </span>
        </div>
      )}

      {/* Current user rank banner — outside top 100 */}
      {!hasCurrentUserInList && currentUserEntry && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Trophy className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">
              Kamu: #{currentUserEntry.rank ?? "di luar top 100"}
            </p>
            <p className="text-xs text-muted-foreground">
              Skor: {Math.round(currentUserEntry.score)} — Terus berlatih!
            </p>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {([1, 0, 2] as const).map((idx) => {
            const entry = entries[idx];
            if (!entry) return null;
            const rank = idx + 1;
            const isMe = entry.userId === currentUserId;

            return (
              <div
                key={entry.id}
                className={cn(
                  cardCls,
                  "text-center",
                  rank === 1 && "ring-amber-400/40",
                  isMe && "ring-primary/30 bg-primary/5",
                )}
              >
                <div className="px-2 py-4">
                  <div
                    className={cn(
                      "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                      medalBg[idx] ?? "bg-muted",
                      medalColors[idx] ?? "text-muted-foreground",
                    )}
                  >
                    {getInitials(entry.user.name)}
                  </div>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      medalColors[idx] ?? "text-muted-foreground",
                    )}
                  >
                    #{rank}
                  </p>
                  <p className="truncate text-xs font-medium">
                    {entry.user.name ?? "Anonim"}
                  </p>
                  {isMe && (
                    <Badge
                      variant="outline"
                      className="mt-0.5 text-[9px] text-primary border-primary/30"
                    >
                      Kamu
                    </Badge>
                  )}
                  <p className="mt-1 text-base font-bold text-primary">
                    {Math.round(entry.score)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Ranking List */}
      <div className={cardCls}>
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold tracking-tight">
            Peringkat Lengkap
          </h3>
        </div>
        <div className="px-4 pb-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <UserX className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="font-medium">Belum ada peserta</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentUserId
                  ? "Selesaikan paket ini untuk tampil di leaderboard."
                  : "Belum ada peserta di leaderboard ini."}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {entries.map((entry, idx) => {
                const isCurrentUser = entry.userId === currentUserId;

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      isCurrentUser
                        ? "bg-primary/5 ring-1 ring-primary/20 font-medium"
                        : "hover:bg-muted/50",
                    )}
                  >
                    {/* Rank */}
                    <span className="w-6 shrink-0 text-center font-mono text-xs">
                      {idx < 3 ? (
                        <Medal
                          className={cn(
                            "inline h-3.5 w-3.5",
                            medalColors[idx] ?? "text-muted-foreground",
                          )}
                        />
                      ) : (
                        <span
                          className={cn(
                            "text-muted-foreground",
                            isCurrentUser && "text-primary",
                          )}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </span>

                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        idx < 3
                          ? (medalBg[idx] ?? "bg-muted")
                          : "bg-muted",
                        idx < 3
                          ? (medalColors[idx] ?? "text-muted-foreground")
                          : "text-muted-foreground",
                        isCurrentUser && idx >= 3 && "bg-primary/10 text-primary",
                      )}
                    >
                      {getInitials(entry.user.name)}
                    </div>

                    {/* Name */}
                    <span className="flex-1 truncate text-sm">
                      {entry.user.name ?? "Anonim"}
                      {isCurrentUser && (
                        <Badge
                          variant="outline"
                          className="ml-1.5 text-[9px] text-primary border-primary/30"
                        >
                          Kamu
                        </Badge>
                      )}
                    </span>

                    {/* Correct count */}
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {entry.attempt.totalCorrect ?? "-"} benar
                    </span>

                    {/* Score */}
                    <span
                      className={cn(
                        "w-12 shrink-0 text-right text-sm font-bold tabular-nums",
                        isCurrentUser && "text-primary",
                      )}
                    >
                      {Math.round(entry.score)}
                    </span>
                  </div>
                );
              })}

              {/* User outside top 100 */}
              {!hasCurrentUserInList && currentUserEntry && (
                <>
                  <div className="my-2 flex items-center gap-2 px-2.5 text-xs text-muted-foreground">
                    <div className="flex-1 border-t border-dashed" />
                    <span>posisi kamu</span>
                    <div className="flex-1 border-t border-dashed" />
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-2 text-sm font-medium">
                    <span className="w-6 shrink-0 text-center font-mono text-xs text-primary">
                      {currentUserEntry.rank ?? "?"}
                    </span>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {getInitials(session?.user?.name ?? null)}
                    </div>
                    <span className="flex-1 truncate">
                      {session?.user?.name ?? "Kamu"}
                      <Badge
                        variant="outline"
                        className="ml-1.5 text-[9px] text-primary border-primary/30"
                      >
                        Kamu
                      </Badge>
                    </span>
                    <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-primary">
                      {Math.round(currentUserEntry.score)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
