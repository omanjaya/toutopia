import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { StartExamButtonMobile } from "./start-exam-button-mobile";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  FileText,
  Shield,
  RotateCcw,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Try Out",
};

export default async function MobilePackageDetailPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const userId = (session.user as { id: string }).id;

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

  const userAttempts = await prisma.examAttempt.findMany({
    where: { userId, packageId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      status: true,
      score: true,
      startedAt: true,
      finishedAt: true,
    },
  });

  const inProgress = userAttempts.find((a) => a.status === "IN_PROGRESS");
  const canStart = userAttempts.length < pkg.maxAttempts && !inProgress;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/m/tryout"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="truncate text-base font-semibold">{pkg.title}</h1>
      </div>

      <div className="space-y-4 px-4 pt-5">
        {/* Hero */}
        <div>
          <Badge variant="outline" className="mb-2 text-[10px]">
            {pkg.category.name}
          </Badge>
          <h2 className="text-xl font-bold tracking-tight">{pkg.title}</h2>
          {pkg.description && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {pkg.description}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">
                  {pkg.totalQuestions}
                </p>
                <p className="text-[11px] text-muted-foreground">Soal</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">
                  {pkg.durationMinutes}
                </p>
                <p className="text-[11px] text-muted-foreground">Menit</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <RotateCcw className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">
                  {pkg.maxAttempts}x
                </p>
                <p className="text-[11px] text-muted-foreground">Percobaan</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Shield className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">
                  {pkg.isAntiCheat ? "Aktif" : "Mati"}
                </p>
                <p className="text-[11px] text-muted-foreground">Anti-Cheat</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price & Participants */}
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Harga</p>
              {pkg.isFree ? (
                <Badge className="mt-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  GRATIS
                </Badge>
              ) : (
                <div className="mt-1 flex items-baseline gap-2">
                  {pkg.discountPrice !== null &&
                    pkg.discountPrice < pkg.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(pkg.price)}
                      </span>
                    )}
                  <p className="text-lg font-bold">
                    {formatCurrency(pkg.discountPrice ?? pkg.price)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{pkg._count.attempts} peserta</span>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        {pkg.sections.length > 0 && (
          <div>
            <h3 className="mb-2.5 text-sm font-semibold">Struktur Ujian</h3>
            <div className="space-y-2">
              {pkg.sections.map((section, idx) => (
                <Card key={section.id} className="border-0 shadow-sm">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {idx + 1}. {section.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section.subject.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <p>{section.totalQuestions} soal</p>
                      <p>{section.durationMinutes} menit</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Previous Attempts */}
        {userAttempts.length > 0 && (
          <div>
            <h3 className="mb-2.5 text-sm font-semibold">Riwayat Percobaan</h3>
            <div className="space-y-2">
              {userAttempts.map((attempt, idx) => (
                <Card key={attempt.id} className="border-0 shadow-sm">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">
                        Percobaan {userAttempts.length - idx}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(attempt.startedAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      {attempt.status === "IN_PROGRESS" ? (
                        <Badge variant="outline" className="text-[10px]">
                          Sedang Berlangsung
                        </Badge>
                      ) : attempt.score !== null ? (
                        <p className="text-lg font-bold tabular-nums">
                          {Math.round(attempt.score)}
                        </p>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          {attempt.status}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <StartExamButtonMobile
        packageId={packageId}
        inProgressAttemptId={inProgress?.id}
        canStart={canStart}
        maxAttempts={pkg.maxAttempts}
        attemptCount={userAttempts.length}
      />
    </div>
  );
}
