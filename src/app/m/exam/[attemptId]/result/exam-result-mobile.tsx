"use client";

import { useState, useEffect, useCallback } from "react";
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
  BookOpen,
  BarChart3,
  Share2,
  RotateCcw,
  Video,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
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
  videoUrl: string | null;
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

interface ExamResultMobileProps {
  attemptId: string;
}

export function ExamResultMobile({ attemptId }: ExamResultMobileProps) {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "review">("summary");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function fetchResult(): Promise<void> {
      try {
        const response = await fetch(`/api/exam/${attemptId}/result`);
        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error?.message ?? "Gagal memuat hasil");
          router.push("/m/dashboard");
          return;
        }

        setData(result.data);
      } catch {
        toast.error("Gagal memuat hasil ujian");
        router.push("/m/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [attemptId, router]);

  function toggleQuestion(questionId: string): void {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }

  function toggleExplanation(questionId: string): void {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }

  async function handleShare(): Promise<void> {
    if (!data) return;

    const score = Math.round(data.score ?? 0);
    const text = `Skor saya ${score}/1000 pada ${data.packageTitle} di Toutopia!`;
    const url = `${window.location.origin}/exam/${attemptId}/result`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Hasil Ujian Toutopia", text, url });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success("Link hasil berhasil disalin!");
      } catch {
        toast.error("Gagal menyalin link");
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Memuat hasil ujian...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-dvh items-center justify-center px-6">
        <p className="text-center text-muted-foreground">
          Hasil tidak ditemukan
        </p>
      </div>
    );
  }

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

  const scoreColor =
    passed === true
      ? "text-emerald-600"
      : passed === false
        ? "text-destructive"
        : score >= 700
          ? "text-emerald-600"
          : score >= 500
            ? "text-amber-600"
            : "text-destructive";

  const scoreBg =
    passed === true
      ? "from-emerald-50 to-teal-50"
      : passed === false
        ? "from-red-50 to-rose-50"
        : "from-primary/5 to-violet-50/50";

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b bg-background/95 px-3 backdrop-blur safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 px-2 text-xs"
          asChild
        >
          <Link href="/m/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 pb-8 pt-4 space-y-4">
        {/* Hero Score Card */}
        <div
          className={cn(
            "rounded-2xl bg-gradient-to-br p-6 text-center",
            scoreBg
          )}
        >
          <div className="mb-3 flex justify-center">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                passed === true
                  ? "bg-emerald-100"
                  : passed === false
                    ? "bg-red-100"
                    : "bg-primary/10"
              )}
            >
              <Trophy className={cn("h-8 w-8", scoreColor)} />
            </div>
          </div>

          <p className="truncate text-xs font-medium text-muted-foreground">
            {data.packageTitle}
          </p>
          <p
            className={cn(
              "mt-1 text-5xl font-bold tracking-tight tabular-nums",
              scoreColor
            )}
          >
            {score}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            dari 1000 poin
          </p>

          {passed !== null && (
            <Badge
              variant={passed ? "default" : "destructive"}
              className="mt-3 px-3 py-0.5 text-xs"
            >
              {passed ? "Lulus" : "Tidak Lulus"}
              {data.passingScore && ` · PS: ${data.passingScore}`}
            </Badge>
          )}

          {data.percentile && (
            <p className="mt-2 text-xs text-muted-foreground">
              Lebih baik dari{" "}
              <span className="font-semibold text-foreground">
                {Math.round(data.percentile)}%
              </span>{" "}
              peserta lain
            </p>
          )}
        </div>

        {/* Stats Row — 3 cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-xl border bg-card p-3">
            <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-500" />
            <p className="text-xl font-bold tabular-nums">
              {data.totalCorrect ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Benar</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border bg-card p-3">
            <XCircle className="mb-1 h-4 w-4 text-destructive" />
            <p className="text-xl font-bold tabular-nums">
              {data.totalIncorrect ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Salah</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border bg-card p-3">
            <MinusCircle className="mb-1 h-4 w-4 text-muted-foreground" />
            <p className="text-xl font-bold tabular-nums">
              {data.totalUnanswered ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Kosong</p>
          </div>
        </div>

        {/* Duration */}
        {duration !== null && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Durasi pengerjaan: {duration} menit
          </div>
        )}

        {/* Violations */}
        {data.violations > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Terdeteksi <strong>{data.violations}</strong> pelanggaran selama
            ujian.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              activeTab === "summary"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              activeTab === "review"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Pembahasan
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="space-y-2">
            {data.sections.map((section) => {
              const pct =
                section.total > 0
                  ? Math.round((section.correct / section.total) * 100)
                  : 0;

              return (
                <div
                  key={section.id}
                  className="rounded-xl border bg-card p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {section.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section.subjectName}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        {section.correct}/{section.total}
                      </span>
                      <span
                        className={cn(
                          "min-w-[3rem] rounded-full px-2 py-0.5 text-center text-xs font-bold",
                          pct >= 70
                            ? "bg-emerald-100 text-emerald-700"
                            : pct >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        )}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct >= 70
                          ? "bg-emerald-500"
                          : pct >= 40
                            ? "bg-amber-500"
                            : "bg-destructive"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Tab */}
        {activeTab === "review" && (
          <div className="space-y-4">
            {data.sections.map((section) => (
              <div key={section.id} className="space-y-2">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{section.title}</h3>
                  <Badge variant="outline" className="text-[10px] tabular-nums">
                    {section.correct}/{section.total}
                  </Badge>
                </div>

                {/* Questions list */}
                {section.questions.map((q, qIdx) => {
                  const isExpanded = expandedQuestions.has(q.id);
                  const showExplanation = expandedExplanations.has(q.id);

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "overflow-hidden rounded-xl border",
                        q.isCorrect === true
                          ? "border-emerald-200 bg-emerald-50/30"
                          : q.isCorrect === false
                            ? "border-destructive/20 bg-destructive/5"
                            : "border-border/60 bg-muted/10"
                      )}
                    >
                      {/* Question row — tappable to expand */}
                      <button
                        onClick={() => toggleQuestion(q.id)}
                        className="flex w-full min-h-[44px] items-center gap-2.5 p-3 text-left"
                      >
                        {/* Status icon */}
                        {q.isCorrect === true ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                        ) : q.isCorrect === false ? (
                          <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                        ) : (
                          <MinusCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )}

                        {/* Question number + preview */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium">
                            Soal {qIdx + 1}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {q.content.replace(/<[^>]*>/g, "").slice(0, 60)}
                            {q.content.length > 60 ? "..." : ""}
                          </p>
                        </div>

                        {/* Chevron */}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t px-3 pb-3 pt-3 space-y-3 overflow-hidden">
                          {/* Full question */}
                          <MathRenderer
                            content={q.content}
                            className="prose prose-sm max-w-none text-sm leading-relaxed break-words dark:prose-invert [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:overflow-x-auto"
                          />

                          {q.imageUrl && (
                            <img
                              src={q.imageUrl}
                              alt="Gambar soal"
                              className="max-h-40 max-w-full rounded-lg"
                            />
                          )}

                          {/* Options */}
                          <div className="space-y-1.5">
                            {q.options.map((opt) => {
                              const isSelected =
                                q.selectedOptionId === opt.id ||
                                q.selectedOptions.includes(opt.id);

                              return (
                                <div
                                  key={opt.id}
                                  className={cn(
                                    "flex items-start gap-2 rounded-lg px-2.5 py-2 text-sm",
                                    opt.isCorrect &&
                                      "bg-emerald-100/70 dark:bg-emerald-950/30",
                                    isSelected &&
                                      !opt.isCorrect &&
                                      "bg-destructive/10"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                      opt.isCorrect
                                        ? "bg-emerald-500 text-white"
                                        : isSelected
                                          ? "bg-destructive text-white"
                                          : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {opt.label}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <MathRenderer
                                      content={opt.content}
                                      className="text-xs"
                                    />
                                    {opt.imageUrl && (
                                      <img
                                        src={opt.imageUrl}
                                        alt={`Opsi ${opt.label}`}
                                        className="mt-1 max-h-32 max-w-full rounded-lg"
                                      />
                                    )}
                                  </div>
                                  {opt.isCorrect && (
                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                  )}
                                  {isSelected && !opt.isCorrect && (
                                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Pembahasan toggle */}
                          {q.explanation && (
                            <div>
                              <button
                                onClick={() => toggleExplanation(q.id)}
                                className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-blue-600"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                {showExplanation
                                  ? "Sembunyikan pembahasan"
                                  : "Lihat pembahasan"}
                              </button>

                              {showExplanation && (
                                <div className="mt-2 rounded-lg border border-blue-200/60 bg-blue-50/50 p-3">
                                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                                    Pembahasan
                                  </p>
                                  <MathRenderer
                                    content={q.explanation}
                                    className="prose prose-sm max-w-none text-xs break-words dark:prose-invert [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:overflow-x-auto"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Video pembahasan */}
                          {q.videoUrl && (
                            <div className="rounded-lg border border-purple-200/60 bg-purple-50/50 p-3">
                              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-600">
                                <Video className="h-3 w-3" />
                                Video Pembahasan
                              </p>
                              <div className="aspect-video overflow-hidden rounded-lg">
                                <iframe
                                  src={q.videoUrl
                                    .replace("watch?v=", "embed/")
                                    .replace("youtu.be/", "youtube.com/embed/")}
                                  className="h-full w-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title="Video Pembahasan"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2.5 pt-4 pb-4 safe-bottom">
          <Button className="h-12 w-full rounded-xl" asChild>
            <Link href="/m/dashboard">
              <RotateCcw className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </Button>
          {activeTab === "summary" && (
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl"
              onClick={() => setActiveTab("review")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Lihat Pembahasan
            </Button>
          )}
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Bagikan Hasil
          </Button>
        </div>
      </div>
    </div>
  );
}
