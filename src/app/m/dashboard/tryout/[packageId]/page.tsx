import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { StartExamButton } from "./start-exam-button";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowLeft,
  Clock,
  FileText,
  Shield,
  Users,
  RotateCcw,
  Trophy,
  ShoppingCart,
  BarChart2,
  Target,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, cn } from "@/shared/lib/utils";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Try Out",
};

export default async function MobileTryoutDetailPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;
  const session = await auth();

  const pkg = await prisma.examPackage.findUnique({
    where: { id: packageId, status: "PUBLISHED" },
    include: {
      category: { select: { name: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          subject: { select: { name: true } },
        },
      },
      _count: { select: { attempts: true } },
    },
  });

  if (!pkg) notFound();

  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [userAttempts, leaderboardEntry, leaderboardTotal] = await Promise.all([
    userId
      ? prisma.examAttempt.findMany({
          where: { userId, packageId },
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            status: true,
            score: true,
            startedAt: true,
            finishedAt: true,
          },
        })
      : Promise.resolve([]),
    userId
      ? prisma.leaderboardEntry.findUnique({
          where: { packageId_userId: { packageId, userId } },
          select: { rank: true, score: true },
        })
      : Promise.resolve(null),
    prisma.leaderboardEntry.count({ where: { packageId } }),
  ]);

  const inProgress = userAttempts.find((a) => a.status === "IN_PROGRESS");
  const canStart =
    userId !== undefined &&
    userAttempts.length < pkg.maxAttempts &&
    !inProgress;

  const showBuyButton = !pkg.isFree && userAttempts.length === 0;

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Back nav */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard/tryout"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="line-clamp-1 flex-1 text-xl font-semibold tracking-tight">
          Detail Try Out
        </h1>
      </div>

      {/* Title block */}
      <div className="mb-4">
        <Badge variant="outline" className="mb-2">
          {pkg.category.name}
        </Badge>
        <h2 className="text-lg font-bold leading-snug tracking-tight">
          {pkg.title}
        </h2>
        {pkg.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {pkg.description}
          </p>
        )}
      </div>

      {/* Info stats — 2-column grid on mobile */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{pkg.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Soal</p>
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{pkg.durationMinutes}</p>
              <p className="text-xs text-muted-foreground">Menit</p>
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4">
            <RotateCcw className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{pkg.maxAttempts}x</p>
              <p className="text-xs text-muted-foreground">Percobaan</p>
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4">
            <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">
                {pkg.isAntiCheat ? "Aktif" : "Off"}
              </p>
              <p className="text-xs text-muted-foreground">Anti-Cheat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price + participants row */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShoppingCart className="h-4 w-4" />
          <span className="font-semibold text-foreground">
            {pkg.isFree ? "Gratis" : formatCurrency(pkg.discountPrice ?? pkg.price)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{pkg._count.attempts.toLocaleString("id-ID")} peserta</span>
        </div>
        {pkg.passingScore !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>
              Nilai kelulusan:{" "}
              <span className="font-semibold text-foreground">
                {pkg.passingScore}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* User leaderboard rank */}
      {userId && (
        <div
          className={cn(
            cardCls,
            "mb-4",
            leaderboardEntry
              ? "border border-amber-500/30 bg-amber-500/5"
              : "border border-dashed",
          )}
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Peringkat Kamu</p>
                {leaderboardEntry ? (
                  <p className="text-sm text-muted-foreground">
                    #{leaderboardEntry.rank ?? "?"} dari {leaderboardTotal}{" "}
                    peserta
                    {leaderboardEntry.score !== null && (
                      <>
                        {" "}
                        &middot; Skor:{" "}
                        <span className="font-medium text-foreground">
                          {Math.round(leaderboardEntry.score)}
                        </span>
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada peringkat — selesaikan try out untuk masuk
                    leaderboard
                  </p>
                )}
              </div>
            </div>
            <Link
              href={`/m/dashboard/leaderboard/${packageId}`}
              className="mt-3 flex items-center gap-1 text-sm font-medium text-primary"
            >
              Lihat Leaderboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Buy button for paid packages where user hasn't started */}
      {showBuyButton && (
        <div
          className={cn(
            cardCls,
            "mb-4 border border-primary/20 bg-primary/5",
          )}
        >
          <div className="p-4">
            <p className="font-semibold">Paket Berbayar</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Beli paket ini untuk mendapatkan akses penuh
            </p>
            <Button asChild className="mt-3 w-full">
              <Link href={`/dashboard/payment?packageId=${packageId}`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Beli Sekarang —{" "}
                {formatCurrency(pkg.discountPrice ?? pkg.price)}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Exam structure */}
      <div className={cn(cardCls, "mb-4")}>
        <div className="px-4 pb-2 pt-4">
          <h3 className="text-base font-semibold tracking-tight">
            Struktur Ujian
          </h3>
        </div>
        <div className="space-y-2 px-4 pb-4 pt-2">
          {pkg.sections.map((section, idx) => (
            <div
              key={section.id}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {idx + 1}. {section.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {section.subject.name}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm text-muted-foreground">
                <p>{section.totalQuestions} soal</p>
                <p>{section.durationMinutes} menit</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous attempts */}
      {userAttempts.length > 0 && (
        <div className={cn(cardCls, "mb-4")}>
          <div className="px-4 pb-2 pt-4">
            <h3 className="text-base font-semibold tracking-tight">
              Riwayat Percobaan
            </h3>
          </div>
          <div className="space-y-2 px-4 pb-4 pt-2">
            {userAttempts.map((attempt, idx) => {
              const isCompleted = attempt.status === "COMPLETED";
              const row = (
                <div className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <div>
                    <p className="font-medium">
                      Percobaan {userAttempts.length - idx}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.startedAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {attempt.status === "IN_PROGRESS" ? (
                      <Badge variant="outline" className="text-xs">
                        Berlangsung
                      </Badge>
                    ) : attempt.score !== null ? (
                      <p className="text-lg font-bold">
                        {Math.round(attempt.score)}
                      </p>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {attempt.status}
                      </Badge>
                    )}
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                  </div>
                </div>
              );

              return isCompleted ? (
                <Link
                  key={attempt.id}
                  href={`/exam/${attempt.id}/result`}
                  className="block rounded-xl transition-colors active:bg-muted/50"
                >
                  {row}
                </Link>
              ) : (
                <div key={attempt.id}>{row}</div>
              );
            })}
          </div>
        </div>
      )}

      {/* Start / Continue CTA */}
      {!showBuyButton && (
        <div className="mb-4">
          <StartExamButton
            packageId={packageId}
            inProgressAttemptId={inProgress?.id}
            canStart={canStart}
            maxAttempts={pkg.maxAttempts}
            attemptCount={userAttempts.length}
          />
        </div>
      )}

      {/* Leaderboard link */}
      <div className="flex justify-center">
        <Button asChild variant="outline" size="sm">
          <Link href={`/m/dashboard/leaderboard/${packageId}`}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Lihat Leaderboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
