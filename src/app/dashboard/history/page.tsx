import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { History, ArrowRight } from "lucide-react";

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6" />
          Riwayat Try Out
        </h2>
        <p className="text-muted-foreground">
          Semua percobaan try out yang pernah kamu kerjakan
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/dashboard/history${opt.value !== "all" ? `?status=${opt.value}` : ""}`}
          >
            <Badge
              variant={currentStatus === opt.value ? "default" : "outline"}
              className="cursor-pointer"
            >
              {opt.label}
            </Badge>
          </Link>
        ))}
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Belum ada riwayat try out.{" "}
              <Link href="/dashboard/tryout" className="text-primary hover:underline">
                Mulai sekarang
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt) => (
            <Link
              key={attempt.id}
              href={
                attempt.status === "COMPLETED"
                  ? `/exam/${attempt.id}/result`
                  : attempt.status === "IN_PROGRESS"
                  ? `/exam/${attempt.id}`
                  : `/exam/${attempt.id}/result`
              }
            >
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer mb-3">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{attempt.package.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {attempt.startedAt.toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>·</span>
                      <span>
                        Durasi: {formatDuration(attempt.startedAt, attempt.finishedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {attempt.status === "COMPLETED" && attempt.score != null && (
                      <div className="text-right">
                        <p className="text-lg font-bold">{Math.round(attempt.score)}</p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.totalCorrect ?? 0}/{attempt.package.totalQuestions} benar
                        </p>
                      </div>
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
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/dashboard/history?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
            >
              <Badge variant="outline" className="cursor-pointer">
                Sebelumnya
              </Badge>
            </Link>
          )}
          <span className="text-sm text-muted-foreground py-1">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dashboard/history?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
            >
              <Badge variant="outline" className="cursor-pointer">
                Selanjutnya
              </Badge>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
