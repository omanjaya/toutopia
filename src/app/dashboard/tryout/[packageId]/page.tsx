import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { StartExamButton } from "./start-exam-button";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
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

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Try Out",
};

export default async function TryOutDetailPage({
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

  // Show buy button when: paid package + user has no attempts (likely not purchased)
  const showBuyButton = !pkg.isFree && userAttempts.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 md:pb-0">
      {/* Title */}
      <div>
        <Badge variant="outline" className="mb-2">
          {pkg.category.name}
        </Badge>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{pkg.title}</h2>
        {pkg.description && (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{pkg.description}</p>
        )}
      </div>

      {/* Info Grid — 2-col on mobile, 5-col on desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4 sm:p-6">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold sm:text-2xl">{pkg.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Soal</p>
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4 sm:p-6">
            <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold sm:text-2xl">{pkg.durationMinutes}</p>
              <p className="text-xs text-muted-foreground">Menit</p>
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4 sm:p-6">
            <RotateCcw className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold sm:text-2xl">{pkg.maxAttempts}x</p>
              <p className="text-xs text-muted-foreground">Percobaan</p>
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-3 p-4 sm:p-6">
            <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold sm:text-2xl">
                {pkg.isAntiCheat ? "Aktif" : "Off"}
              </p>
              <p className="text-xs text-muted-foreground">Anti-Cheat</p>
            </div>
          </div>
        </div>
        <div className={cn(cardCls, "col-span-2 lg:col-span-1")}>
          <div className="flex items-center gap-3 p-4 sm:p-6">
            <ShoppingCart className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold leading-tight">
                {pkg.isFree
                  ? "Gratis"
                  : formatCurrency(pkg.discountPrice ?? pkg.price)}
              </p>
              <p className="text-xs text-muted-foreground">Harga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Passing score + participants */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{pkg._count.attempts} peserta</span>
        </div>
        {pkg.passingScore !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>
              Nilai Kelulusan:{" "}
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
            leaderboardEntry
              ? "border border-amber-500/30 bg-amber-500/5"
              : "border border-dashed"
          )}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Peringkat Kamu</p>
                {leaderboardEntry ? (
                  <p className="text-sm text-muted-foreground">
                    #{leaderboardEntry.rank ?? "?"} dari {leaderboardTotal} peserta
                    {leaderboardEntry.score !== null && (
                      <> &middot; Skor: <span className="font-medium text-foreground">{Math.round(leaderboardEntry.score)}</span></>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada peringkat — selesaikan try out untuk masuk leaderboard
                  </p>
                )}
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={`/dashboard/leaderboard/${packageId}`}>
                  <span className="hidden sm:inline">Lihat Leaderboard</span>
                  <ArrowRight className="h-4 w-4 sm:ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Buy button for paid packages where user hasn't started */}
      {showBuyButton && (
        <div className={`${cardCls} border border-primary/20 bg-primary/5`}>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="font-semibold">Paket Berbayar</p>
              <p className="text-sm text-muted-foreground">
                Beli paket ini untuk mendapatkan akses penuh
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/dashboard/payment?packageId=${packageId}`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Beli Sekarang —{" "}
                {formatCurrency(pkg.discountPrice ?? pkg.price)}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold tracking-tight">Struktur Ujian</h3>
        </div>
        <div className="space-y-3 p-6 pt-2">
          {pkg.sections.map((section, idx) => (
            <div
              key={section.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">
                  {idx + 1}. {section.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {section.subject.name}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{section.totalQuestions} soal</p>
                <p>{section.durationMinutes} menit</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Attempts */}
      {userAttempts.length > 0 && (
        <div className={cardCls}>
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-lg font-semibold tracking-tight">Riwayat Percobaan</h3>
          </div>
          <div className="space-y-2 p-6 pt-2">
            {userAttempts.map((attempt, idx) => {
              const isCompleted = attempt.status === "COMPLETED";
              const row = (
                <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">
                      Percobaan {userAttempts.length - idx}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(attempt.startedAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {attempt.status === "IN_PROGRESS" ? (
                      <Badge variant="outline">Sedang Berlangsung</Badge>
                    ) : attempt.score !== null ? (
                      <p className="text-lg font-bold">
                        {Math.round(attempt.score)}
                      </p>
                    ) : (
                      <Badge variant="secondary">{attempt.status}</Badge>
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
                  className="block rounded-lg transition-colors hover:bg-muted/50"
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

      {/* Start / Continue button */}
      {!showBuyButton && (
        <StartExamButton
          packageId={packageId}
          inProgressAttemptId={inProgress?.id}
          canStart={canStart}
          maxAttempts={pkg.maxAttempts}
          attemptCount={userAttempts.length}
        />
      )}

      {/* Leaderboard link */}
      <div className="flex justify-center">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/leaderboard/${packageId}`}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Lihat Leaderboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
