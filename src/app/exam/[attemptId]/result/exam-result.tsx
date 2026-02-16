"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Trophy,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { MathRenderer } from "@/shared/components/shared/math-renderer";
import { cn } from "@/shared/lib/utils";

interface Option {
  id: string;
  label: string;
  content: string;
  imageUrl: string | null;
  isCorrect: boolean;
}

interface Question {
  id: string;
  content: string;
  type: string;
  explanation: string | null;
  imageUrl: string | null;
  options: Option[];
  selectedOptionId: string | null;
  selectedOptions: string[];
  numericAnswer: number | null;
  isCorrect: boolean | null;
  timeSpentSeconds: number;
  correctOptionIds: string[];
}

interface Section {
  id: string;
  title: string;
  subjectName: string;
  questions: Question[];
  correct: number;
  total: number;
}

interface ResultData {
  id: string;
  status: string;
  packageTitle: string;
  score: number | null;
  totalCorrect: number | null;
  totalIncorrect: number | null;
  totalUnanswered: number | null;
  percentile: number | null;
  violations: number;
  startedAt: string;
  finishedAt: string | null;
  passingScore: number | null;
  sections: Section[];
}

interface ExamResultProps {
  attemptId: string;
}

export function ExamResult({ attemptId }: ExamResultProps) {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`/api/exam/${attemptId}/result`);
        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error?.message ?? "Gagal memuat hasil");
          router.push("/dashboard/tryout");
          return;
        }

        setData(result.data);
      } catch {
        toast.error("Gagal memuat hasil ujian");
        router.push("/dashboard/tryout");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [attemptId, router]);

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Hasil tidak ditemukan</p>
      </div>
    );
  }

  const totalQuestions =
    (data.totalCorrect ?? 0) +
    (data.totalIncorrect ?? 0) +
    (data.totalUnanswered ?? 0);
  const score = Math.round(data.score ?? 0);
  const passed = data.passingScore ? score >= data.passingScore : null;

  const duration =
    data.startedAt && data.finishedAt
      ? Math.round(
          (new Date(data.finishedAt).getTime() -
            new Date(data.startedAt).getTime()) /
            60_000
        )
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/tryout">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hasil Ujian</h2>
          <p className="text-muted-foreground">{data.packageTitle}</p>
        </div>
      </div>

      {/* Score Card */}
      <Card
        className={cn(
          "border-2",
          passed === true
            ? "border-emerald-500"
            : passed === false
            ? "border-destructive"
            : ""
        )}
      >
        <CardContent className="flex flex-col items-center py-8">
          <Trophy
            className={cn(
              "mb-4 h-12 w-12",
              passed === true
                ? "text-emerald-500"
                : passed === false
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          />
          <p className="text-5xl font-bold">{score}</p>
          <p className="mt-1 text-lg text-muted-foreground">dari 1000</p>
          {passed !== null && (
            <Badge
              variant={passed ? "default" : "destructive"}
              className="mt-3"
            >
              {passed ? "Lulus" : "Tidak Lulus"}
              {data.passingScore && ` (Passing: ${data.passingScore})`}
            </Badge>
          )}
          {data.percentile && (
            <p className="mt-2 text-sm text-muted-foreground">
              Persentil: {Math.round(data.percentile)}%
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{data.totalCorrect ?? 0}</p>
              <p className="text-xs text-muted-foreground">Benar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{data.totalIncorrect ?? 0}</p>
              <p className="text-xs text-muted-foreground">Salah</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <MinusCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{data.totalUnanswered ?? 0}</p>
              <p className="text-xs text-muted-foreground">Kosong</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {duration ? `${duration}m` : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Waktu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown per Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.sections.map((section) => {
            const pct =
              section.total > 0
                ? Math.round((section.correct / section.total) * 100)
                : 0;

            return (
              <div key={section.id} className="rounded-lg border">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div>
                    <p className="font-medium">{section.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {section.subjectName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {section.correct}/{section.total}
                      </p>
                      <p className="text-xs text-muted-foreground">{pct}%</p>
                    </div>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {expandedSections.has(section.id) && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    {section.questions.map((q, qIdx) => (
                      <div key={q.id} className="space-y-2">
                        <div className="flex items-start gap-2">
                          {q.isCorrect === true ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          ) : q.isCorrect === false ? (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          ) : (
                            <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Soal {qIdx + 1}
                            </p>
                            <MathRenderer
                              content={q.content}
                              className="prose prose-sm max-w-none text-sm dark:prose-invert"
                            />
                          </div>
                        </div>

                        {/* Options with correct/wrong highlighting */}
                        <div className="ml-6 space-y-1">
                          {q.options.map((opt) => {
                            const isSelected =
                              q.selectedOptionId === opt.id ||
                              q.selectedOptions.includes(opt.id);
                            const isCorrect = opt.isCorrect;

                            return (
                              <div
                                key={opt.id}
                                className={cn(
                                  "flex items-start gap-2 rounded px-2 py-1 text-sm",
                                  isCorrect && "bg-emerald-50 dark:bg-emerald-950/20",
                                  isSelected &&
                                    !isCorrect &&
                                    "bg-destructive/10"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                    isCorrect
                                      ? "bg-emerald-500 text-white"
                                      : isSelected
                                      ? "bg-destructive text-white"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {opt.label}
                                </span>
                                <MathRenderer
                                  content={opt.content}
                                  className="flex-1 text-sm"
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="ml-6 rounded-lg bg-muted/50 p-3">
                            <p className="mb-1 text-xs font-semibold text-muted-foreground">
                              Pembahasan:
                            </p>
                            <MathRenderer
                              content={q.explanation}
                              className="prose prose-sm max-w-none text-sm dark:prose-invert"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Violations */}
      {data.violations > 0 && (
        <Card className="border-amber-500">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-600">
              Terdeteksi {data.violations} pelanggaran selama ujian.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3 pb-8">
        <Button variant="outline" asChild>
          <Link href="/dashboard/tryout">Kembali ke Katalog</Link>
        </Button>
      </div>
    </div>
  );
}
