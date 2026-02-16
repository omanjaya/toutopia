import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { StartExamButton } from "./start-exam-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, FileText, Shield, Users, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

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

  const userAttempts = session?.user?.id
    ? await prisma.examAttempt.findMany({
        where: { userId: session.user.id, packageId },
        orderBy: { startedAt: "desc" },
        select: { id: true, status: true, score: true, startedAt: true, finishedAt: true },
      })
    : [];

  const inProgress = userAttempts.find((a) => a.status === "IN_PROGRESS");
  const canStart = userAttempts.length < pkg.maxAttempts && !inProgress;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge variant="outline" className="mb-2">{pkg.category.name}</Badge>
        <h2 className="text-2xl font-bold tracking-tight">{pkg.title}</h2>
        {pkg.description && (
          <p className="mt-1 text-muted-foreground">{pkg.description}</p>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{pkg.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Soal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{pkg.durationMinutes}</p>
              <p className="text-xs text-muted-foreground">Menit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{pkg.maxAttempts}x</p>
              <p className="text-xs text-muted-foreground">Percobaan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {pkg.isAntiCheat ? "Aktif" : "Nonaktif"}
              </p>
              <p className="text-xs text-muted-foreground">Anti-Cheat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Harga</p>
            <p className="text-xl font-bold">
              {pkg.isFree ? "Gratis" : formatCurrency(pkg.discountPrice ?? pkg.price)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {pkg._count.attempts} peserta
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Struktur Ujian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      {/* Previous Attempts */}
      {userAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Percobaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {userAttempts.map((attempt, idx) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">Percobaan {userAttempts.length - idx}</p>
                  <p className="text-muted-foreground">
                    {new Date(attempt.startedAt).toLocaleDateString("id-ID", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  {attempt.status === "IN_PROGRESS" ? (
                    <Badge variant="outline">Sedang Berlangsung</Badge>
                  ) : attempt.score !== null ? (
                    <p className="text-lg font-bold">
                      {Math.round(attempt.score)}
                    </p>
                  ) : (
                    <Badge variant="secondary">{attempt.status}</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Start Button */}
      <StartExamButton
        packageId={packageId}
        inProgressAttemptId={inProgress?.id}
        canStart={canStart}
        maxAttempts={pkg.maxAttempts}
        attemptCount={userAttempts.length}
      />
    </div>
  );
}
