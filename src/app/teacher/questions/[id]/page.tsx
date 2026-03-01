import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { TeacherQuestionActions } from "./teacher-question-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Soal",
};

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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
  const canEdit = question.status === "DRAFT" || question.status === "REJECTED";
  const canDelete = question.status === "DRAFT";

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

      {(canEdit || canDelete) && (
        <TeacherQuestionActions
          questionId={question.id}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold tracking-tight">Informasi</h3>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-3">
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
        </div>
      </div>

      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold tracking-tight">Pertanyaan</h3>
        </div>
        <div className="p-6">
          <MathRenderer
            content={question.content}
            className="prose prose-sm max-w-none dark:prose-invert"
          />
        </div>
      </div>

      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold tracking-tight">Opsi Jawaban</h3>
        </div>
        <div className="p-6 space-y-3">
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
        </div>
      </div>

      {question.explanation && (
        <div className={cardCls}>
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-lg font-semibold tracking-tight">Pembahasan</h3>
          </div>
          <div className="p-6">
            <MathRenderer
              content={question.explanation}
              className="prose prose-sm max-w-none dark:prose-invert"
            />
          </div>
        </div>
      )}

      {question.reviewNote && (
        <div className={`${cardCls}${question.status === "REJECTED" ? " ring-destructive" : ""}`}>
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-lg font-semibold tracking-tight">Catatan Review</h3>
          </div>
          <div className="p-6">
            <p className="text-sm">{question.reviewNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
