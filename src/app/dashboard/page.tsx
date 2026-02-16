import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { BookOpen, Trophy, Target, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getDashboardStats(userId: string) {
  const [completedAttempts, allScores, recentAttempts, todayTasks] =
    await Promise.all([
      prisma.examAttempt.count({
        where: { userId, status: "COMPLETED" },
      }),
      prisma.examAttempt.findMany({
        where: { userId, status: "COMPLETED", score: { not: null } },
        select: { score: true, startedAt: true, finishedAt: true },
      }),
      prisma.examAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 5,
        include: {
          package: { select: { title: true, slug: true } },
        },
      }),
      prisma.studyTask.findMany({
        where: {
          plan: { userId },
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        orderBy: { startTime: "asc" },
        take: 5,
        include: { plan: { select: { title: true } } },
      }),
    ]);

  const scores = allScores.map((a) => a.score!);
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  // Calculate total study time in minutes
  let totalMinutes = 0;
  for (const a of allScores) {
    if (a.finishedAt && a.startedAt) {
      totalMinutes += Math.round(
        (a.finishedAt.getTime() - a.startedAt.getTime()) / 60000
      );
    }
  }

  return {
    completedAttempts,
    bestScore,
    avgScore,
    totalMinutes,
    recentAttempts,
    todayTasks,
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as { id: string })?.id;
  const stats = userId ? await getDashboardStats(userId) : null;

  const statCards = [
    {
      title: "Try Out Selesai",
      value: stats?.completedAttempts?.toString() ?? "0",
      icon: BookOpen,
      description: "Total try out yang telah dikerjakan",
    },
    {
      title: "Skor Tertinggi",
      value: stats?.bestScore != null ? `${stats.bestScore}` : "-",
      icon: Trophy,
      description: "Skor terbaik kamu",
    },
    {
      title: "Rata-rata Skor",
      value: stats?.avgScore != null ? `${stats.avgScore}` : "-",
      icon: Target,
      description: "Rata-rata dari semua percobaan",
    },
    {
      title: "Waktu Belajar",
      value: stats ? formatDuration(stats.totalMinutes) : "0 menit",
      icon: Clock,
      description: "Total waktu mengerjakan try out",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Halo, {session?.user?.name}
        </h2>
        <p className="text-muted-foreground">
          Berikut ringkasan aktivitas belajar kamu
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Riwayat Terbaru</CardTitle>
            <Link
              href="/dashboard/history"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAttempts.map((attempt) => (
                  <Link
                    key={attempt.id}
                    href={
                      attempt.status === "COMPLETED"
                        ? `/exam/${attempt.id}/result`
                        : `/exam/${attempt.id}`
                    }
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {attempt.package.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.startedAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {attempt.status === "COMPLETED" && attempt.score != null && (
                        <span className="text-sm font-semibold">
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada riwayat try out. Mulai try out pertamamu sekarang!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jadwal Belajar Hari Ini</CardTitle>
            <Link
              href="/dashboard/planner"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Planner <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.todayTasks && stats.todayTasks.length > 0 ? (
              <div className="space-y-3">
                {stats.todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.plan.title}
                        {task.startTime && ` · ${task.startTime}`}
                        {task.duration && ` · ${task.duration} menit`}
                      </p>
                    </div>
                    {task.isCompleted && (
                      <Badge variant="default">Selesai</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada jadwal belajar hari ini. Buat rencana di menu Planner.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
