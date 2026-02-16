import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Clock, FileText, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog Try Out",
};

export default async function TryOutCatalogPage() {
  const session = await auth();

  const packages = await prisma.examPackage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFree: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { name: true } },
      sections: {
        orderBy: { order: "asc" },
        select: { title: true, totalQuestions: true, durationMinutes: true },
      },
      _count: { select: { attempts: true } },
    },
  });

  // Get user's attempts for showing status
  const userAttempts = session?.user?.id
    ? await prisma.examAttempt.findMany({
        where: { userId: session.user.id },
        select: { id: true, packageId: true, status: true, score: true },
      })
    : [];

  const attemptsByPackage = new Map<
    string,
    { id: string; status: string; score: number | null }[]
  >();
  for (const a of userAttempts) {
    const list = attemptsByPackage.get(a.packageId) ?? [];
    list.push({ id: a.id, status: a.status, score: a.score });
    attemptsByPackage.set(a.packageId, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Katalog Try Out</h2>
        <p className="text-muted-foreground">
          Pilih paket try out untuk mulai latihan
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const attempts = attemptsByPackage.get(pkg.id) ?? [];
          const inProgress = attempts.find((a) => a.status === "IN_PROGRESS");
          const bestScore = attempts
            .filter((a) => a.score !== null)
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]?.score;

          return (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline">{pkg.category.name}</Badge>
                  {pkg.isFree ? (
                    <Badge variant="secondary">Gratis</Badge>
                  ) : (
                    <span className="text-sm font-semibold">
                      {formatCurrency(pkg.discountPrice ?? pkg.price)}
                    </span>
                  )}
                </div>
                <CardTitle className="mt-2">{pkg.title}</CardTitle>
                {pkg.description && (
                  <p className="text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {pkg.totalQuestions} soal
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {pkg.durationMinutes} menit
                  </span>
                </div>

                <div className="space-y-1">
                  {pkg.sections.map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {s.title} ({s.totalQuestions} soal, {s.durationMinutes}m)
                    </p>
                  ))}
                </div>

                {bestScore !== undefined && bestScore !== null && (
                  <p className="text-sm">
                    Skor terbaik:{" "}
                    <span className="font-semibold">
                      {Math.round(bestScore)}
                    </span>
                  </p>
                )}

                <div className="pt-2">
                  {inProgress ? (
                    <Button asChild className="w-full">
                      <Link href={`/exam/${inProgress.id}`}>
                        Lanjutkan Ujian
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full" variant={
                      attempts.length >= pkg.maxAttempts ? "outline" : "default"
                    }>
                      <Link href={`/dashboard/tryout/${pkg.id}`}>
                        {attempts.length >= pkg.maxAttempts
                          ? "Lihat Hasil"
                          : "Mulai Try Out"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {packages.length === 0 && (
          <div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">
            Belum ada paket try out yang tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
