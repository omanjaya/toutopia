import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowLeft,
  History,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Timer,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riwayat Ujian",
};

interface HistoryPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const statusConfig: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    bgColor: string;
    badgeVariant: "default" | "secondary" | "destructive";
  }
> = {
  COMPLETED: {
    label: "Selesai",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    badgeVariant: "default",
  },
  IN_PROGRESS: {
    label: "Berlangsung",
    icon: Timer,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    badgeVariant: "secondary",
  },
  TIMED_OUT: {
    label: "Waktu Habis",
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    badgeVariant: "destructive",
  },
  ABANDONED: {
    label: "Ditinggalkan",
    icon: AlertCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    badgeVariant: "secondary",
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return "-";
  const diffMs = end.getTime() - start.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
}

export default async function MobileHistoryPage({
  searchParams,
}: HistoryPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;
  const statusFilter = params.status;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 10;

  const where = {
    userId,
    ...(statusFilter && statusFilter !== "all"
      ? {
          status: statusFilter as
            | "COMPLETED"
            | "IN_PROGRESS"
            | "TIMED_OUT"
            | "ABANDONED",
        }
      : {}),
  };

  const [attempts, total] = await Promise.all([
    prisma.examAttempt.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        package: {
          select: { title: true, slug: true, totalQuestions: true },
        },
      },
    }),
    prisma.examAttempt.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const filterOptions = [
    { value: "all", label: "Semua" },
    { value: "COMPLETED", label: "Selesai" },
    { value: "IN_PROGRESS", label: "Berlangsung" },
    { value: "TIMED_OUT", label: "Waktu Habis" },
  ];

  const currentFilter = statusFilter ?? "all";

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
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Riwayat Ujian
          </h1>
        </div>
        {total > 0 && (
          <Badge variant="secondary" className="text-xs">
            {total} total
          </Badge>
        )}
      </div>

      {/* Status Filter Pills */}
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filterOptions.map((opt) => (
          <Link
            key={opt.value}
            href={
              opt.value === "all"
                ? "/m/dashboard/history"
                : `/m/dashboard/history?status=${opt.value}`
            }
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              currentFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Attempt List */}
      {attempts.length > 0 ? (
        <div className="space-y-2">
          {attempts.map((attempt) => {
            const config =
              statusConfig[attempt.status] ?? statusConfig.ABANDONED;
            const StatusIcon = config.icon;

            return (
              <Link
                key={attempt.id}
                href={
                  attempt.status === "IN_PROGRESS"
                    ? `/m/exam/${attempt.id}`
                    : `/m/exam/${attempt.id}/result`
                }
              >
                <Card className="border-0 shadow-sm transition-colors active:bg-muted/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    {/* Status Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        config.bgColor,
                      )}
                    >
                      <StatusIcon className={cn("h-5 w-5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {attempt.package.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {attempt.startedAt.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDuration(
                            attempt.startedAt,
                            attempt.finishedAt,
                          )}
                        </span>
                      </div>
                      <Badge
                        variant={config.badgeVariant}
                        className="mt-1.5 text-[10px]"
                      >
                        {config.label}
                      </Badge>
                    </div>

                    {/* Score */}
                    {attempt.status === "COMPLETED" &&
                      attempt.score != null && (
                        <div className="shrink-0 text-right">
                          <p
                            className={cn(
                              "text-xl font-bold tabular-nums",
                              getScoreColor(Math.round(attempt.score)),
                            )}
                          >
                            {Math.round(attempt.score)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {attempt.totalCorrect ?? 0}/
                            {attempt.package.totalQuestions}
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <History className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold">Belum ada riwayat</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Kerjakan try out pertamamu untuk melihat riwayat di sini.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4" >
            <Link href="/m/tryout">Mulai Try Out</Link>
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/m/dashboard/history?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sebelumnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>
          )}

          <span className="text-sm text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/m/dashboard/history?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
              >
                Selanjutnya
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
