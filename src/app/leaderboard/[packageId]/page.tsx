import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Trophy, Medal, Crown, ChevronLeft, ArrowRight, Users, Target, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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
    description: `Peringkat peserta terbaik paket try out ${pkg.title} (${pkg.category.name}). Lihat siapa yang berada di puncak dan raih posisi terbaikmu di Toutopia!`,
  };
}

export default async function PublicPackageLeaderboardPage({
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
      include: {
        user: { select: { name: true, avatar: true } },
        attempt: {
          select: { totalCorrect: true, finishedAt: true },
        },
      },
    }),
    prisma.leaderboardEntry.aggregate({
      where: { packageId },
      _count: true,
      _max: { score: true },
      _avg: { score: true },
    }),
  ]);

  const medalColors = [
    "text-amber-500",
    "text-slate-400",
    "text-orange-600",
  ];

  const podiumGradients = [
    "from-amber-500/15 to-amber-500/5 border-amber-500/30",
    "from-slate-400/15 to-slate-400/5 border-slate-300/30",
    "from-orange-500/15 to-orange-500/5 border-orange-500/30",
  ];

  const podiumAvatarBg = [
    "bg-amber-500/20 text-amber-700",
    "bg-slate-400/20 text-slate-600",
    "bg-orange-500/20 text-orange-700",
  ];

  const topHighlightBg = [
    "bg-amber-500/5 border-l-2 border-l-amber-500",
    "bg-slate-400/5 border-l-2 border-l-slate-400",
    "bg-orange-500/5 border-l-2 border-l-orange-500",
  ];

  const medalBg = ["bg-amber-500/10", "bg-slate-400/10", "bg-orange-600/10"];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
        <Link
          href="/leaderboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Semua Leaderboard
        </Link>

        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center">
            <Badge variant="outline" className="mb-3">
              {pkg.category.name}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {pkg.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Peringkat peserta terbaik
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className={cardCls}>
              <div className="flex flex-col items-center py-3 sm:py-4">
                <Users className="mb-1.5 h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                <p className="text-xl font-bold sm:text-2xl">{stats._count}</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Peserta</p>
              </div>
            </div>
            <div className={cardCls}>
              <div className="flex flex-col items-center py-3 sm:py-4">
                <Target className="mb-1.5 h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
                <p className="text-xl font-bold sm:text-2xl">
                  {stats._max.score ? Math.round(stats._max.score) : 0}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Tertinggi</p>
              </div>
            </div>
            <div className={cardCls}>
              <div className="flex flex-col items-center py-3 sm:py-4">
                <TrendingUp className="mb-1.5 h-4 w-4 text-primary sm:h-5 sm:w-5" />
                <p className="text-xl font-bold sm:text-2xl">
                  {stats._avg.score ? Math.round(stats._avg.score) : 0}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Rata-rata</p>
              </div>
            </div>
          </div>

          {/* Top 3 Podium */}
          {entries.length >= 3 && (
            <>
              {/* Mobile podium: initials avatars */}
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                {([1, 0, 2] as const).map((idx) => {
                  const entry = entries[idx];
                  if (!entry) return null;
                  const rank = idx + 1;
                  const isFirst = rank === 1;

                  return (
                    <div
                      key={entry.id}
                      className={cn(cardCls, "text-center", podiumGradients[idx])}
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
                            medalColors[idx] ?? "text-muted-foreground"
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
                            idx === 2 && "bg-orange-500"
                          )}
                        >
                          {rank}
                        </div>
                        <p className={cn("truncate font-semibold", isFirst ? "text-xs" : "text-[10px]")}>
                          {entry.user.name ?? "Anonim"}
                        </p>
                        <p className={cn("mt-0.5 font-bold tabular-nums text-primary", isFirst ? "text-xl" : "text-base")}>
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

              {/* Desktop podium: Avatar component */}
              <div className="hidden sm:grid grid-cols-3 items-end gap-3">
                {[1, 0, 2].map((idx) => {
                  const entry = entries[idx];
                  if (!entry) return null;
                  const rank = idx + 1;
                  const isFirst = rank === 1;

                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        `${cardCls} bg-gradient-to-b text-center transition-all`,
                        podiumGradients[idx],
                        isFirst && "scale-[1.02]"
                      )}
                    >
                      <div className={cn("pt-6 pb-5", isFirst && "pt-8 pb-6")}>
                        {isFirst && (
                          <Crown className="mx-auto mb-1 h-6 w-6 text-amber-500" />
                        )}

                        <Avatar
                          size={isFirst ? "lg" : "default"}
                          className={cn("mx-auto mb-3", podiumAvatarBg[idx])}
                        >
                          {entry.user.avatar && (
                            <AvatarImage src={entry.user.avatar} alt={entry.user.name ?? ""} />
                          )}
                          <AvatarFallback className={cn(podiumAvatarBg[idx], isFirst ? "text-sm" : "text-xs")}>
                            {getInitials(entry.user.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className={cn(
                          "mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full font-bold",
                          idx === 0 && "bg-amber-500 text-white",
                          idx === 1 && "bg-slate-400 text-white",
                          idx === 2 && "bg-orange-500 text-white",
                        )}>
                          {rank}
                        </div>

                        <p className={cn("truncate font-semibold", isFirst ? "text-sm" : "text-xs")}>
                          {entry.user.name ?? "Anonim"}
                        </p>
                        <p className={cn("mt-0.5 font-bold text-primary", isFirst ? "text-2xl" : "text-lg")}>
                          {Math.round(entry.score)}
                        </p>
                        {entry.attempt.totalCorrect != null && (
                          <p className="text-xs text-muted-foreground">
                            {entry.attempt.totalCorrect} benar
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Full Ranking */}
          <div className={cardCls}>
            <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2 sm:text-lg">
                <Trophy className="h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
                Peringkat Lengkap
              </h3>
            </div>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              {/* Table header — desktop only */}
              <div className="mb-2 hidden sm:flex items-center gap-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="w-8 text-right">#</span>
                <span className="flex-1">Peserta</span>
                <span className="w-16 text-right">Benar</span>
                <span className="w-20 text-right">Skor</span>
              </div>

              <div className="space-y-0.5">
                {entries.map((entry, idx) => {
                  const isTop3 = idx < 3;
                  const maxScore = stats._max.score ?? 1;
                  const scorePercent = Math.round((entry.score / maxScore) * 100);

                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors sm:gap-3 sm:rounded-lg sm:px-3 sm:py-2.5",
                        isTop3 ? topHighlightBg[idx] : "even:bg-muted/30"
                      )}
                    >
                      {/* Rank */}
                      <span className="w-6 shrink-0 text-center sm:w-8 sm:text-right">
                        {isTop3 ? (
                          <Medal
                            className={cn(
                              "inline h-3.5 w-3.5 sm:h-4 sm:w-4",
                              medalColors[idx]
                            )}
                          />
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">
                            {idx + 1}
                          </span>
                        )}
                      </span>

                      {/* Avatar initials */}
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isTop3 ? (medalBg[idx] ?? "bg-muted") : "bg-muted",
                          isTop3 ? (medalColors[idx] ?? "text-muted-foreground") : "text-muted-foreground"
                        )}
                      >
                        {getInitials(entry.user.name)}
                      </div>

                      {/* Name */}
                      <span className={cn("flex-1 truncate", isTop3 && "font-medium")}>
                        {entry.user.name ?? "Anonim"}
                      </span>

                      {/* Correct — hidden on smallest screens */}
                      <span className="hidden w-16 text-right text-muted-foreground sm:inline">
                        {entry.attempt.totalCorrect ?? "-"}
                      </span>

                      {/* Score with bar */}
                      <span className="flex shrink-0 items-center justify-end gap-2">
                        <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-muted sm:block">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              isTop3 ? "bg-primary" : "bg-primary/60"
                            )}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </span>
                        <span className={cn(
                          "w-10 text-right tabular-nums",
                          isTop3 ? "font-bold" : "font-semibold"
                        )}>
                          {Math.round(entry.score)}
                        </span>
                      </span>
                    </div>
                  );
                })}

                {entries.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-muted-foreground">
                    <Trophy className="mb-3 h-10 w-10 opacity-20" />
                    <p className="font-medium">Belum ada peserta</p>
                    <p className="mt-1 text-sm">Jadilah yang pertama di leaderboard ini!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className={`${cardCls} bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20`}>
            <div className="flex flex-col items-center px-4 py-7 sm:py-8 text-center">
              <Trophy className="mb-3 h-8 w-8 text-primary" />
              <p className="mb-1 font-semibold">Ingin masuk leaderboard ini?</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Kerjakan try out dan raih peringkat terbaikmu!
              </p>
              <Button asChild className="rounded-full px-6">
                <Link href={`/packages/${pkg.slug}`}>
                  Kerjakan Try Out
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
