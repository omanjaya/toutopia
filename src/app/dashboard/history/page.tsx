import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { History, ArrowRight, ChevronLeft, ChevronRight, Clock, CheckCircle2, Timer, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { SegmentedNav } from "./segmented-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riwayat Try Out",
};

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return "-";
  const diffMs = end.getTime() - start.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; badgeVariant: "default" | "secondary" | "destructive" }> = {
  COMPLETED: { label: "Selesai", icon: CheckCircle2, color: "text-emerald-500", badgeVariant: "default" },
  IN_PROGRESS: { label: "Berlangsung", icon: Timer, color: "text-blue-500", badgeVariant: "secondary" },
  TIMED_OUT: { label: "Waktu Habis", icon: AlertCircle, color: "text-red-500", badgeVariant: "destructive" },
  ABANDONED: { label: "Ditinggalkan", icon: AlertCircle, color: "text-muted-foreground", badgeVariant: "secondary" },
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;
  const statusFilter = params.status;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 10;

  const where = {
    userId,
    ...(statusFilter && statusFilter !== "all"
      ? { status: statusFilter as "COMPLETED" | "IN_PROGRESS" | "TIMED_OUT" | "ABANDONED" }
      : {}),
  };

  const [attempts, total] = await Promise.all([
    prisma.examAttempt.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        package: { select: { title: true, slug: true, totalQuestions: true } },
      },
    }),
    prisma.examAttempt.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const statusOptions = [
    { value: "all", label: "Semua" },
    { value: "COMPLETED", label: "Selesai" },
    { value: "IN_PROGRESS", label: "Berlangsung" },
    { value: "TIMED_OUT", label: "Waktu Habis" },
  ];

  const currentStatus = statusFilter ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6" />
            Riwayat Try Out
          </h2>
          <p className="text-muted-foreground">
            Semua percobaan try out yang pernah kamu kerjakan
          </p>
        </div>
        {total > 0 && (
          <Badge variant="secondary" className="text-sm">
            {total} total
          </Badge>
        )}
      </div>

      <SegmentedNav
        options={statusOptions}
        value={currentStatus}
        baseHref="/dashboard/history"
        paramKey="status"
      />

      {attempts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <History className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">Belum ada riwayat</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Kerjakan try out pertamamu untuk melihat riwayat di sini.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/dashboard/tryout">
                Mulai Try Out
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {attempts.map((attempt) => {
            const config = statusConfig[attempt.status] ?? statusConfig.ABANDONED;
            const StatusIcon = config.icon;
            const scorePercent = attempt.score != null && attempt.package.totalQuestions > 0
              ? Math.round((attempt.score / 100) * 100)
              : null;

            return (
              <Link
                key={attempt.id}
                href={
                  attempt.status === "IN_PROGRESS"
                    ? `/exam/${attempt.id}`
                    : `/exam/${attempt.id}/result`
                }
              >
                <Card className="group transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-px mb-2">
                  <CardContent className="flex items-center gap-4 py-4">
                    {/* Status icon */}
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      attempt.status === "COMPLETED" && "bg-emerald-500/10",
                      attempt.status === "IN_PROGRESS" && "bg-blue-500/10",
                      attempt.status === "TIMED_OUT" && "bg-red-500/10",
                      attempt.status === "ABANDONED" && "bg-muted",
                    )}>
                      <StatusIcon className={cn("h-5 w-5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {attempt.package.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>
                          {attempt.startedAt.toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(attempt.startedAt, attempt.finishedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    {attempt.status === "COMPLETED" && attempt.score != null && (
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold tabular-nums">
                          {Math.round(attempt.score)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.totalCorrect ?? 0}/{attempt.package.totalQuestions}
                        </p>
                      </div>
                    )}

                    {/* Badge + Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={config.badgeVariant}>
                        {config.label}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/dashboard/history?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
                href={`/dashboard/history?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
