import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { MathRenderer } from "@/shared/components/shared/math-renderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Soal",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  APPROVED: { label: "Disetujui", variant: "default" },
  PENDING_REVIEW: { label: "Menunggu Review", variant: "outline" },
  DRAFT: { label: "Draft", variant: "secondary" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
};

const difficultyLabel: Record<string, string> = {
  VERY_EASY: "Sangat Mudah",
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HARD: "Sulit",
  VERY_HARD: "Sangat Sulit",
};

export default async function TeacherQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      topic: {
        include: {
          subject: {
            include: {
              subCategory: {
                include: { category: { select: { name: true } } },
              },
            },
          },
        },
      },
      options: { orderBy: { order: "asc" } },
    },
  });

  if (!question || question.createdById !== session.user.id) notFound();

  const status = statusConfig[question.status] ?? { label: question.status, variant: "secondary" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teacher/questions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Detail Soal</h2>
          <p className="text-muted-foreground">
            {question.topic.subject.subCategory.category.name} &gt;{" "}
            {question.topic.subject.name} &gt; {question.topic.name}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Tipe</p>
            <p className="text-sm">{question.type.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kesulitan</p>
            <p className="text-sm">{difficultyLabel[question.difficulty]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sumber</p>
            <p className="text-sm">{question.source ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pertanyaan</CardTitle>
        </CardHeader>
        <CardContent>
          <MathRenderer
            content={question.content}
            className="prose prose-sm max-w-none dark:prose-invert"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opsi Jawaban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                opt.isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : ""
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                opt.isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {opt.label}
              </span>
              <MathRenderer content={opt.content} className="flex-1 text-sm" />
              {opt.isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {question.explanation && (
        <Card>
          <CardHeader>
            <CardTitle>Pembahasan</CardTitle>
          </CardHeader>
          <CardContent>
            <MathRenderer
              content={question.explanation}
              className="prose prose-sm max-w-none dark:prose-invert"
            />
          </CardContent>
        </Card>
      )}

      {question.reviewNote && (
        <Card className={question.status === "REJECTED" ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle>Catatan Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{question.reviewNote}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
