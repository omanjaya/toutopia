import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  TrendingUp,
  BookOpen,
  Coins,
  Target,
  FileText,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface DashboardStats {
  avgScore: number | null;
  completedAttempts: number;
  creditBalance: number;
  freeCredits: number;
  recentAttempts: Array<{
    id: string;
    status: string;
    score: number | null;
    startedAt: Date;
    package: { title: string };
  }>;
}

async function getMobileDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const [scoreAgg, recentAttempts, credits] = await Promise.all([
    prisma.examAttempt.aggregate({
      where: { userId, status: "COMPLETED", score: { not: null } },
      _count: true,
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
        package: { select: { title: true } },
      },
    }),
    prisma.userCredit.findUnique({
      where: { userId },
      select: { balance: true, freeCredits: true },
    }),
  ]);

  return {
    avgScore: scoreAgg._avg.score ? Math.round(scoreAgg._avg.score) : null,
    completedAttempts: scoreAgg._count,
    creditBalance: credits?.balance ?? 0,
    freeCredits: credits?.freeCredits ?? 0,
    recentAttempts,
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "Selesai";
    case "IN_PROGRESS":
      return "Berlangsung";
    case "TIMED_OUT":
      return "Waktu Habis";
    default:
      return "Ditinggalkan";
  }
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "IN_PROGRESS":
      return "secondary";
    case "TIMED_OUT":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function MobileDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const userId = (session.user as { id: string }).id;
  const stats = await getMobileDashboardStats(userId);
  const firstName = session.user.name?.split(" ")[0] ?? "Kamu";
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale });

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Halo, {firstName}!
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Stats Row — horizontal scroll */}
      <div className="-mx-4 mb-6 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Card className="min-w-[140px] shrink-0 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xs text-muted-foreground">Skor Rata-rata</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums">
              {stats.avgScore ?? "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[140px] shrink-0 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">Total Ujian</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums">
              {stats.completedAttempts}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[140px] shrink-0 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Coins className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xs text-muted-foreground">Kredit</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums">
              {stats.creditBalance + stats.freeCredits}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 space-y-3">
        <Link href="/m/tryout">
          <Card className="border-0 bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Target className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Mulai Tryout</p>
                <p className="text-sm text-primary-foreground/70">
                  Pilih paket dan mulai ujian
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary-foreground/70" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/m/dashboard/practice">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Latihan Soal</p>
                <p className="text-sm text-muted-foreground">
                  Berlatih tanpa batas waktu
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Attempts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Riwayat Terbaru</h2>
          <Link
            href="/m/dashboard/history"
            className="text-sm text-primary"
          >
            Lihat semua
          </Link>
        </div>

        {stats.recentAttempts.length > 0 ? (
          <div className="space-y-2">
            {stats.recentAttempts.map((attempt) => (
              <Link
                key={attempt.id}
                href={
                  attempt.status === "COMPLETED"
                    ? `/m/exam/${attempt.id}/result`
                    : `/m/exam/${attempt.id}`
                }
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {attempt.package.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(attempt.startedAt), "d MMM yyyy", {
                            locale: idLocale,
                          })}
                        </span>
                        <Badge
                          variant={getStatusVariant(attempt.status)}
                          className="text-[10px]"
                        >
                          {getStatusLabel(attempt.status)}
                        </Badge>
                      </div>
                    </div>
                    {attempt.status === "COMPLETED" &&
                      attempt.score != null && (
                        <span
                          className={cn(
                            "text-lg font-bold tabular-nums",
                            getScoreColor(Math.round(attempt.score)),
                          )}
                        >
                          {Math.round(attempt.score)}
                        </span>
                      )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center py-10 text-center">
              <BookOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Belum ada riwayat try out.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
