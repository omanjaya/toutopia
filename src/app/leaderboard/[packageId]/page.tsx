import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
    title: `Leaderboard ${pkg.title} — Toutopia`,
    description: `Peringkat peserta terbaik untuk ${pkg.title}. Lihat skor dan posisi di leaderboard Toutopia.`,
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

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/leaderboard"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Semua Leaderboard
        </Link>

        <div className="space-y-8">
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
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="flex flex-col items-center py-4">
                <Users className="mb-1.5 h-5 w-5 text-muted-foreground" />
                <p className="text-2xl font-bold">{stats._count}</p>
                <p className="text-xs text-muted-foreground">Peserta</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-4">
                <Target className="mb-1.5 h-5 w-5 text-amber-500" />
                <p className="text-2xl font-bold">
                  {stats._max.score ? Math.round(stats._max.score) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Skor Tertinggi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-4">
                <TrendingUp className="mb-1.5 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {stats._avg.score ? Math.round(stats._avg.score) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Rata-rata</p>
              </CardContent>
            </Card>
          </div>

          {/* Top 3 Podium */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-3 items-end gap-3">
              {/* Order: 2nd, 1st, 3rd */}
              {[1, 0, 2].map((idx) => {
                const entry = entries[idx];
                if (!entry) return null;
                const rank = idx + 1;
                const isFirst = rank === 1;

                return (
                  <Card
                    key={entry.id}
                    className={cn(
                      "bg-gradient-to-b text-center transition-all",
                      podiumGradients[idx],
                      isFirst && "scale-[1.02]"
                    )}
                  >
                    <CardContent className={cn("pt-6 pb-5", isFirst && "pt-8 pb-6")}>
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

                      <p className={cn(
                        "truncate font-semibold",
                        isFirst ? "text-sm" : "text-xs"
                      )}>
                        {entry.user.name ?? "Anonim"}
                      </p>
                      <p className={cn(
                        "mt-0.5 font-bold text-primary",
                        isFirst ? "text-2xl" : "text-lg"
                      )}>
                        {Math.round(entry.score)}
                      </p>
                      {entry.attempt.totalCorrect != null && (
                        <p className="text-xs text-muted-foreground">
                          {entry.attempt.totalCorrect} benar
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Full Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Peringkat Lengkap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table header */}
              <div className="mb-2 flex items-center gap-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isTop3 ? topHighlightBg[idx] : "even:bg-muted/30"
                      )}
                    >
                      {/* Rank */}
                      <span className="w-8 text-right">
                        {isTop3 ? (
                          <Medal
                            className={cn(
                              "inline h-4 w-4",
                              medalColors[idx]
                            )}
                          />
                        ) : (
                          <span className="font-mono text-muted-foreground">
                            {idx + 1}
                          </span>
                        )}
                      </span>

                      {/* User */}
                      <Avatar size="sm">
                        {entry.user.avatar && (
                          <AvatarImage src={entry.user.avatar} alt={entry.user.name ?? ""} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {getInitials(entry.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "flex-1 truncate",
                        isTop3 && "font-medium"
                      )}>
                        {entry.user.name ?? "Anonim"}
                      </span>

                      {/* Correct */}
                      <span className="w-16 text-right text-muted-foreground">
                        {entry.attempt.totalCorrect ?? "-"}
                      </span>

                      {/* Score with bar */}
                      <span className="flex w-20 items-center justify-end gap-2">
                        <span className="hidden sm:block h-1.5 w-10 overflow-hidden rounded-full bg-muted">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              isTop3 ? "bg-primary" : "bg-primary/60"
                            )}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </span>
                        <span className={cn(
                          "tabular-nums",
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
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="flex flex-col items-center py-8">
              <Trophy className="mb-3 h-8 w-8 text-primary" />
              <p className="mb-1 font-semibold">Ingin masuk leaderboard ini?</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Kerjakan try out dan raih peringkat terbaikmu!
              </p>
              <Button asChild>
                <Link href={`/packages/${pkg.slug}`}>
                  Kerjakan Try Out
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
