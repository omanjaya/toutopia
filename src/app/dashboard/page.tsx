import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  BookOpen,
  Trophy,
  Target,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Zap,
  CheckCircle2,
  Bookmark,
  Flame,
} from "lucide-react";
import { StreakBadge } from "@/shared/components/dashboard/streak-badge";
import { ReferralCard } from "@/shared/components/dashboard/referral-card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

type ScoreTrend = "up" | "down" | "neutral";

async function getDashboardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Use today's date at UTC midnight for DailyChallenge date comparison
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const [scoreAgg, recentAttempts, lastTwoScores, todayTasks, streak, dailyChallenge] =
    await Promise.all([
      prisma.examAttempt.aggregate({
        where: { userId, status: "COMPLETED", score: { not: null } },
        _count: true,
        _max: { score: true },
        _avg: { score: true },
      }),
      prisma.examAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          score: true,
          startedAt: true,
          package: { select: { title: true, slug: true } },
        },
      }),
      // Fetch last 2 completed attempts with scores for trend calculation
      prisma.examAttempt.findMany({
        where: { userId, status: "COMPLETED", score: { not: null } },
        orderBy: { finishedAt: "desc" },
        take: 2,
        select: { score: true },
      }),
      prisma.studyTask.findMany({
        where: {
          plan: { userId },
          date: { gte: today, lt: tomorrow },
        },
        orderBy: { startTime: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          startTime: true,
          duration: true,
          isCompleted: true,
          plan: { select: { title: true } },
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: { currentStreak: true, longestStreak: true },
      }),
      prisma.dailyChallenge.findFirst({
        where: {
          date: { gte: todayDate, lt: tomorrowDate },
          isActive: true,
        },
        select: {
          id: true,
          question: {
            select: {
              topic: {
                select: {
                  name: true,
                  subject: { select: { name: true } },
                },
              },
            },
          },
          attempts: {
            where: { userId },
            select: { id: true },
            take: 1,
          },
        },
      }),
    ]);

  // Determine score trend from last 2 completed attempts
  let scoreTrend: ScoreTrend = "neutral";
  if (lastTwoScores.length === 2) {
    const latest = lastTwoScores[0].score!;
    const previous = lastTwoScores[1].score!;
    if (latest > previous) scoreTrend = "up";
    else if (latest < previous) scoreTrend = "down";
    else scoreTrend = "neutral";
  }

  const dailyChallengeCompleted =
    dailyChallenge !== null && dailyChallenge.attempts.length > 0;

  return {
    completedAttempts: scoreAgg._count,
    bestScore: scoreAgg._max.score ? Math.round(scoreAgg._max.score) : null,
    avgScore: scoreAgg._avg.score ? Math.round(scoreAgg._avg.score) : null,
    scoreTrend,
    recentAttempts,
    todayTasks,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    dailyChallenge: dailyChallenge
      ? {
          id: dailyChallenge.id,
          subjectName: dailyChallenge.question.topic.subject.name,
          topicName: dailyChallenge.question.topic.name,
          isCompleted: dailyChallengeCompleted,
        }
      : null,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as { id: string })?.id;
  const stats = userId ? await getDashboardStats(userId) : null;

  const firstName = session?.user?.name?.split(" ")[0] ?? "Kamu";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Halo, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
          </p>
        </div>
        {stats && stats.currentStreak > 0 ? (
          <StreakBadge
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
          />
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
            <Flame className="h-4 w-4" />
            <span>Mulai streak hari ini!</span>
          </div>
        )}
      </div>

      {/* Stat Cards — Bento Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-primary-foreground/70">Try Out Selesai</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                  {stats?.completedAttempts ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-white/15 p-2.5">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skor Tertinggi</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
                  {stats?.bestScore ?? "—"}
                </p>
                {stats?.scoreTrend === "up" && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Meningkat</span>
                  </div>
                )}
                {stats?.scoreTrend === "down" && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Menurun</span>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950/30">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rata-rata Skor</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
                  {stats?.avgScore ?? "—"}
                </p>
                {stats?.scoreTrend === "up" && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Meningkat</span>
                  </div>
                )}
                {stats?.scoreTrend === "down" && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Menurun</span>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenge Teaser */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="rounded-2xl bg-yellow-400/15 p-3">
            <Zap className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">Tantangan Harian</p>
            {stats?.dailyChallenge ? (
              stats.dailyChallenge.isCompleted ? (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stats.dailyChallenge.subjectName} · {stats.dailyChallenge.topicName}
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stats.dailyChallenge.subjectName} · {stats.dailyChallenge.topicName}
                </p>
              )
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Kerjakan soal harian untuk menjaga konsistensi belajarmu!
              </p>
            )}
          </div>
          {stats?.dailyChallenge?.isCompleted ? (
            <div className="flex items-center gap-1.5 shrink-0 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Selesai hari ini!</span>
            </div>
          ) : (
            <Button size="sm" className="shrink-0 rounded-full" asChild>
              <Link href="/dashboard/daily-challenge">
                Kerjakan Sekarang
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Attempts — wider */}
        <Card className="border-0 bg-card shadow-sm lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Riwayat Terbaru</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" asChild>
              <Link href="/dashboard/history">
                Lihat semua <ArrowRight className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
              stats.recentAttempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={
                    attempt.status === "COMPLETED"
                      ? `/exam/${attempt.id}/result`
                      : `/exam/${attempt.id}`
                  }
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{attempt.package.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(attempt.startedAt), "d MMM yyyy", { locale: id })}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    {attempt.status === "COMPLETED" && attempt.score != null && (
                      <span className="text-sm font-semibold tabular-nums">
                        {Math.round(attempt.score)}
                      </span>
                    )}
                    <Badge
                      variant={
                        attempt.status === "COMPLETED"
                          ? "default"
                          : attempt.status === "IN_PROGRESS"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {attempt.status === "COMPLETED"
                        ? "Selesai"
                        : attempt.status === "IN_PROGRESS"
                          ? "Berlangsung"
                          : attempt.status === "TIMED_OUT"
                            ? "Waktu Habis"
                            : "Ditinggalkan"}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Belum ada riwayat try out.</p>
                <Button size="sm" className="mt-4 rounded-full" asChild>
                  <Link href="/dashboard/tryout">Mulai Try Out</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Tasks — narrower */}
        <Card className="border-0 bg-card shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Jadwal Hari Ini</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" asChild>
              <Link href="/dashboard/planner">
                Planner <ArrowRight className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.todayTasks && stats.todayTasks.length > 0 ? (
              stats.todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 rounded-xl px-4 py-3 hover:bg-muted/50"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${task.isCompleted ? "bg-emerald-500" : "bg-primary"
                      }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {task.startTime && `${task.startTime}`}
                      {task.duration && ` · ${task.duration} menit`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Tidak ada jadwal hari ini.</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-full" asChild>
                  <Link href="/dashboard/planner">Buat Jadwal</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referral */}
      <ReferralCard />

      {/* Quick Actions — 2x2 Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/tryout">
          <Card className="group cursor-pointer border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Mulai Try Out</p>
                <p className="text-sm text-muted-foreground">Pilih paket dan mulai latihan</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="group cursor-pointer border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Lihat Analitik</p>
                <p className="text-sm text-muted-foreground">Pantau perkembangan skormu</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/practice">
          <Card className="group cursor-pointer border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-blue-50 p-3 dark:bg-blue-950/30">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Mode Latihan</p>
                <p className="text-sm text-muted-foreground">Latihan soal tanpa tekanan waktu</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/bookmarks">
          <Card className="group cursor-pointer border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-purple-50 p-3 dark:bg-purple-950/30">
                <Bookmark className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Bookmark Soal</p>
                <p className="text-sm text-muted-foreground">Tinjau soal yang kamu simpan</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
