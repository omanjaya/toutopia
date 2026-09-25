import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Medal,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const medalColors = ["text-amber-500", "text-slate-400", "text-orange-600"];
const medalBg = ["bg-amber-500/10", "bg-slate-400/10", "bg-orange-600/10"];

const podiumHighlight = [
  "ring-amber-400/40 bg-amber-500/5",
  "ring-slate-300/40 bg-slate-400/5",
  "ring-orange-400/40 bg-orange-500/5",
];

interface PageProps {
  params: Promise<{ packageId: string }>;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

async function getPackage(packageId: string) {
  return prisma.examPackage.findUnique({
    where: { id: packageId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { name: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { packageId } = await params;
  const pkg = await getPackage(packageId);

  if (!pkg) return { title: "Leaderboard" };

  return {
    title: `Leaderboard — ${pkg.title}`,
    description: `Peringkat peserta terbaik paket try out ${pkg.title} (${pkg.category.name}).`,
  };
}

export default async function MobilePublicPackageLeaderboardPage({
  params,
}: PageProps) {
  const { packageId } = await params;
  const pkg = await getPackage(packageId);

  if (!pkg) notFound();

  const [entries, stats] = await Promise.all([
    prisma.leaderboardEntry.findMany({
      where: { packageId },
      orderBy: { score: "desc" },
      take: 100,
      select: {
        id: true,
        userId: true,
        score: true,
        user: { select: { name: true, avatar: true } },
        attempt: { select: { totalCorrect: true } },
      },
    }),
    prisma.leaderboardEntry.aggregate({
      where: { packageId },
      _count: true,
      _max: { score: true },
      _avg: { score: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Back nav */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/leaderboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="truncate text-xs text-muted-foreground">
            {pkg.title}&nbsp;&middot;&nbsp;{pkg.category.name}
          </p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <div className={cardCls}>
          <div className="flex flex-col items-center py-4">
            <Users className="mb-1.5 h-4 w-4 text-muted-foreground" />
            <p className="text-xl font-bold tabular-nums">{stats._count}</p>
            <p className="text-[10px] text-muted-foreground">Peserta</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-col items-center py-4">
            <Target className="mb-1.5 h-4 w-4 text-amber-500" />
            <p className="text-xl font-bold tabular-nums">
              {stats._max.score ? Math.round(stats._max.score) : 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Tertinggi</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-col items-center py-4">
            <TrendingUp className="mb-1.5 h-4 w-4 text-primary" />
            <p className="text-xl font-bold tabular-nums">
              {stats._avg.score ? Math.round(stats._avg.score) : 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Rata-rata</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="mb-5 grid grid-cols-3 gap-2">
          {([1, 0, 2] as const).map((idx) => {
            const entry = entries[idx];
            if (!entry) return null;
            const rank = idx + 1;
            const isFirst = rank === 1;

            return (
              <div
                key={entry.id}
                className={cn(cardCls, "text-center", podiumHighlight[idx])}
              >
                <div className={cn("px-2 pb-4", isFirst ? "pt-5" : "pt-4")}>
                  {isFirst && (
                    <Crown className="mx-auto mb-1.5 h-5 w-5 text-amber-500" />
                  )}
                  <div
                    className={cn(
                      "mx-auto mb-2 flex items-center justify-center rounded-full font-bold",
                      isFirst ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs",
                      medalBg[idx] ?? "bg-muted",
                      medalColors[idx] ?? "text-muted-foreground",
                    )}
                  >
                    {getInitials(entry.user.name)}
                  </div>
                  <div
                    className={cn(
                      "mx-auto mb-1.5 flex items-center justify-center rounded-full font-bold text-white",
                      isFirst ? "h-7 w-7 text-sm" : "h-6 w-6 text-xs",
                      idx === 0 && "bg-amber-500",
                      idx === 1 && "bg-slate-400",
                      idx === 2 && "bg-orange-500",
                    )}
                  >
                    {rank}
                  </div>
                  <p
                    className={cn(
                      "truncate font-semibold",
                      isFirst ? "text-xs" : "text-[10px]",
                    )}
                  >
                    {entry.user.name ?? "Anonim"}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 font-bold tabular-nums text-primary",
                      isFirst ? "text-xl" : "text-base",
                    )}
                  >
                    {Math.round(entry.score)}
                  </p>
                  {entry.attempt.totalCorrect != null && (
                    <p className="text-[10px] text-muted-foreground">
                      {entry.attempt.totalCorrect} benar
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking list */}
      <div className={cardCls}>
        <div className="px-4 pt-4 pb-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Trophy className="h-4 w-4 text-amber-500" />
            Peringkat Lengkap
          </h3>
        </div>
        <div className="px-4 pb-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Trophy className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-medium">Belum ada peserta</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Jadilah yang pertama di leaderboard ini!
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {entries.map((entry, idx) => {
                const isTop3 = idx < 3;
                const maxScore = stats._max.score ?? 1;
                const scorePercent = Math.round((entry.score / maxScore) * 100);

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      isTop3 ? "even:bg-transparent" : "even:bg-muted/30",
                      idx === 0 && "bg-amber-500/5",
                      idx === 1 && "bg-slate-400/5",
                      idx === 2 && "bg-orange-500/5",
                    )}
                  >
                    {/* Rank */}
                    <span className="w-6 shrink-0 text-center font-mono text-xs">
                      {isTop3 ? (
                        <Medal
                          className={cn(
                            "inline h-3.5 w-3.5",
                            medalColors[idx] ?? "text-muted-foreground",
                          )}
                        />
                      ) : (
                        <span className="text-muted-foreground">{idx + 1}</span>
                      )}
                    </span>

                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        isTop3
                          ? (medalBg[idx] ?? "bg-muted")
                          : "bg-muted",
                        isTop3
                          ? (medalColors[idx] ?? "text-muted-foreground")
                          : "text-muted-foreground",
                      )}
                    >
                      {getInitials(entry.user.name)}
                    </div>

                    {/* Name */}
                    <span
                      className={cn(
                        "flex-1 truncate text-sm",
                        isTop3 && "font-medium",
                      )}
                    >
                      {entry.user.name ?? "Anonim"}
                    </span>

                    {/* Score bar + value */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="h-1.5 w-10 overflow-hidden rounded-full bg-muted">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            isTop3 ? "bg-primary" : "bg-primary/60",
                          )}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </span>
                      <span
                        className={cn(
                          "w-10 text-right text-sm tabular-nums",
                          isTop3 ? "font-bold" : "font-semibold",
                        )}
                      >
                        {Math.round(entry.score)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-5">
        <div
          className={cn(
            cardCls,
            "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20",
          )}
        >
          <div className="flex flex-col items-center px-4 py-7 text-center">
            <Trophy className="mb-2 h-8 w-8 text-primary" />
            <p className="font-semibold">Ingin masuk leaderboard ini?</p>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Kerjakan try out dan raih peringkat terbaikmu!
            </p>
            <Button className="rounded-full px-6" asChild>
              <Link href={`/m/dashboard/payment?package=${pkg.slug}`}>
                Kerjakan Try Out
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Category badge */}
      <div className="mt-4 flex justify-center">
        <Badge variant="outline">{pkg.category.name}</Badge>
      </div>
    </div>
  );
}
