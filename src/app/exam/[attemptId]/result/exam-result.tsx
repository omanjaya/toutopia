"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
  RotateCcw,
  TrendingUp,
  Video,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { cn } from "@/shared/lib/utils";
import { ScoreShare } from "@/shared/components/exam/score-share";
import { ExportPdfButton } from "@/shared/components/exam/export-pdf-button";
import { QuestionDiscussion } from "@/shared/components/exam/question-discussion";

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
  packageId?: string;
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

interface SectionComparison {
  title: string;
  subject: string;
  userScore: number;
  avgScore: number;
  diff: number;
}

interface ComparisonData {
  avgScore: number;
  maxScore: number;
  totalParticipants: number;
  sectionComparison: SectionComparison[];
}

interface ExamResultProps {
  attemptId: string;
}

type ReviewFilter = "all" | "correct" | "incorrect" | "unanswered";

// Determines the filter category of a question
function getQuestionFilterCategory(q: Question): ReviewFilter {
  if (q.isCorrect === true) return "correct";
  if (q.isCorrect === false) return "incorrect";
  return "unanswered";
}

// BookmarkButton: isolated component to manage per-question bookmark state
function BookmarkButton({ questionId }: { questionId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) return;
    setPending(true);

    // Optimistic update
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    try {
      if (wasBookmarked && bookmarkId) {
        const res = await fetch(`/api/user/bookmarks/${bookmarkId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus bookmark");
        setBookmarkId(null);
      } else {
        const res = await fetch("/api/user/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId }),
        });
        if (!res.ok) throw new Error("Gagal menyimpan bookmark");
        const result = await res.json() as { data?: { id?: string } };
        if (result.data?.id) {
          setBookmarkId(result.data.id);
        }
      }
    } catch {
      // Revert on failure
      setBookmarked(wasBookmarked);
      toast.error(wasBookmarked ? "Gagal menghapus bookmark" : "Gagal menyimpan bookmark");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      aria-label={bookmarked ? "Hapus bookmark" : "Simpan bookmark"}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        "hover:bg-muted/60 disabled:opacity-50",
        bookmarked ? "text-primary" : "text-muted-foreground"
      )}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </button>
  );
}

export function ExamResult({ attemptId }: ExamResultProps) {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "review">("summary");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");

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

  const fetchComparison = useCallback(async () => {
    try {
      const response = await fetch(`/api/exam/${attemptId}/comparison`);
      const result = await response.json();
      if (response.ok && result.success) {
        setComparison(result.data as ComparisonData);
      }
    } catch {
      // Comparison is optional, fail silently
    }
  }, [attemptId]);

  useEffect(() => {
    if (data) {
      fetchComparison();
    }
  }, [data, fetchComparison]);

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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat hasil ujian...</p>
        </div>
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

  const score = Math.round(data.score ?? 0);
  const passed = data.passingScore ? score >= data.passingScore : null;
  const duration =
    data.startedAt && data.finishedAt
      ? Math.round(
        (new Date(data.finishedAt).getTime() - new Date(data.startedAt).getTime()) / 60_000
      )
      : null;

  // Score color based on performance
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
      ? "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
      : passed === false
        ? "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20"
        : "from-primary/5 to-violet-50/50 dark:from-primary/10 dark:to-violet-950/10";

  // Aggregate counts for filter pills
  const allQuestions = data.sections.flatMap((s) => s.questions);
  const filterCounts: Record<ReviewFilter, number> = {
    all: allQuestions.length,
    correct: allQuestions.filter((q) => q.isCorrect === true).length,
    incorrect: allQuestions.filter((q) => q.isCorrect === false).length,
    unanswered: allQuestions.filter((q) => q.isCorrect === null).length,
  };

  const filterOptions: { value: ReviewFilter; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "correct", label: "Benar" },
    { value: "incorrect", label: "Salah" },
    { value: "unanswered", label: "Tidak Dijawab" },
  ];

  return (
    <div className="result-content mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" asChild>
          <Link href="/dashboard/tryout">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <ExportPdfButton
            contentSelector=".result-content"
            filename={`Hasil-${data.packageTitle.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}`}
          />
          <ScoreShare attemptId={attemptId} score={score} packageTitle={data.packageTitle} />
        </div>
      </div>

      {/* Hero Score Card */}
      <div className={cn("rounded-3xl bg-gradient-to-br p-8 text-center", scoreBg)}>
        <div className="mb-4 flex justify-center">
          <div className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full",
            passed === true ? "bg-emerald-100 dark:bg-emerald-900/30" :
              passed === false ? "bg-red-100 dark:bg-red-900/30" :
                "bg-primary/10"
          )}>
            <Trophy className={cn("h-10 w-10", scoreColor)} />
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground">{data.packageTitle}</p>
        <p className={cn("mt-2 text-7xl font-bold tracking-tight tabular-nums", scoreColor)}>
          {score}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">dari 1000 poin</p>

        {passed !== null && (
          <Badge
            variant={passed ? "default" : "destructive"}
            className="mt-4 px-4 py-1 text-sm"
          >
            {passed ? "Lulus" : "Tidak Lulus"}
            {data.passingScore && ` · Passing Score: ${data.passingScore}`}
          </Badge>
        )}

        {data.percentile && (
          <p className="mt-3 text-sm text-muted-foreground">
            Lebih baik dari <span className="font-semibold text-foreground">{Math.round(data.percentile)}%</span> peserta lain
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="flex flex-col items-center p-4 text-center">
            <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-500" />
            <p className="text-2xl font-bold tabular-nums">{data.totalCorrect ?? 0}</p>
            <p className="text-xs text-muted-foreground">Benar</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="flex flex-col items-center p-4 text-center">
            <XCircle className="mb-2 h-5 w-5 text-destructive" />
            <p className="text-2xl font-bold tabular-nums">{data.totalIncorrect ?? 0}</p>
            <p className="text-xs text-muted-foreground">Salah</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="flex flex-col items-center p-4 text-center">
            <MinusCircle className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold tabular-nums">{data.totalUnanswered ?? 0}</p>
            <p className="text-xs text-muted-foreground">Kosong</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="flex flex-col items-center p-4 text-center">
            <Clock className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold tabular-nums">{duration ? `${duration}m` : "—"}</p>
            <p className="text-xs text-muted-foreground">Durasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Violations warning */}
      {data.violations > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Terdeteksi <strong>{data.violations}</strong> pelanggaran selama ujian berlangsung.
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            activeTab === "summary"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab("review")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            activeTab === "review"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Pembahasan
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          {/* Section Breakdown */}
          <Card className="border-0 bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Breakdown per Seksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.sections.map((section) => {
                const pct = section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0;
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div key={section.id} className="overflow-hidden rounded-xl border border-border/60">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-sm text-muted-foreground">{section.subjectName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Progress bar */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-destructive"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold tabular-nums">{pct}%</span>
                        </div>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {section.correct}/{section.total}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/60 px-4 pb-4 pt-3 space-y-3">
                        {section.questions.map((q, qIdx) => (
                          <div key={q.id} className="flex items-start gap-3">
                            {q.isCorrect === true ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            ) : q.isCorrect === false ? (
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                            ) : (
                              <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">Soal {qIdx + 1}</p>
                              <MathRenderer
                                content={q.content}
                                className="prose prose-sm max-w-none text-sm text-muted-foreground dark:prose-invert line-clamp-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Comparison Section */}
          {comparison && comparison.sectionComparison.length > 0 && (
            <Card className="border-0 bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">
                  Perbandingan dengan Peserta Lain
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Berdasarkan {comparison.totalParticipants} peserta
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparison.sectionComparison}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="title"
                        className="text-xs"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="userScore"
                        name="Skor Anda"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="avgScore"
                        name="Rata-rata"
                        fill="hsl(var(--muted-foreground))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Diff badges */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {comparison.sectionComparison.map((s) => (
                    <div
                      key={s.title}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="text-sm">{s.title}</span>
                      <Badge
                        variant={s.diff >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {s.diff >= 0 ? "+" : ""}
                        {s.diff}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics link */}
          <div className="flex items-center justify-center py-2">
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Lihat perkembangan skor kamu secara keseluruhan
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Review Tab */}
      {activeTab === "review" && (
        <div className="space-y-6">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setReviewFilter(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  reviewFilter === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    "flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full px-1 text-xs tabular-nums",
                    reviewFilter === opt.value
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {filterCounts[opt.value]}
                </span>
              </button>
            ))}
          </div>

          {data.sections.map((section) => {
            // Filter questions in this section
            const filteredQuestions =
              reviewFilter === "all"
                ? section.questions
                : section.questions.filter(
                  (q) => getQuestionFilterCategory(q) === reviewFilter
                );

            // Hide section entirely when no questions match
            if (filteredQuestions.length === 0) return null;

            return (
              <Card key={section.id} className="border-0 bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {section.subjectName} · {section.correct}/{section.total} benar
                        {reviewFilter !== "all" && (
                          <span className="ml-1 text-primary">
                            · {filteredQuestions.length} ditampilkan
                          </span>
                        )}
                      </p>
                    </div>
                    <Badge variant="outline" className="tabular-nums">
                      {section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredQuestions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className={cn(
                        "rounded-xl border p-4 space-y-3",
                        q.isCorrect === true
                          ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/10"
                          : q.isCorrect === false
                            ? "border-destructive/20 bg-destructive/5"
                            : "border-border/60 bg-muted/20"
                      )}
                    >
                      {/* Question header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {qIdx + 1}
                          </span>
                          {q.isCorrect === true ? (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">
                              Benar
                            </Badge>
                          ) : q.isCorrect === false ? (
                            <Badge variant="destructive" className="text-xs">Salah</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Tidak Dijawab</Badge>
                          )}
                        </div>
                        <BookmarkButton questionId={q.id} />
                      </div>

                      {/* Question content */}
                      <MathRenderer
                        content={q.content}
                        className="prose prose-sm max-w-none dark:prose-invert"
                      />
                      {q.imageUrl && (
                        <img src={q.imageUrl} alt="Gambar soal" className="max-h-48 rounded-lg" />
                      )}

                      {/* Options */}
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const isSelected =
                            q.selectedOptionId === opt.id || q.selectedOptions.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              className={cn(
                                "flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm",
                                opt.isCorrect && "bg-emerald-100/70 dark:bg-emerald-950/30",
                                isSelected && !opt.isCorrect && "bg-destructive/10"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                  opt.isCorrect
                                    ? "bg-emerald-500 text-white"
                                    : isSelected
                                      ? "bg-destructive text-white"
                                      : "bg-muted text-muted-foreground"
                                )}
                              >
                                {opt.label}
                              </span>
                              <div className="flex-1">
                                <MathRenderer content={opt.content} className="text-sm" />
                                {opt.imageUrl && (
                                  <img
                                    src={opt.imageUrl}
                                    alt={`Opsi ${opt.label}`}
                                    className="mt-1.5 max-h-36 rounded-lg"
                                  />
                                )}
                              </div>
                              {opt.isCorrect && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />}
                              {isSelected && !opt.isCorrect && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Pembahasan
                          </p>
                          <MathRenderer
                            content={q.explanation}
                            className="prose prose-sm max-w-none text-sm dark:prose-invert"
                          />
                        </div>
                      )}

                      {/* Video Pembahasan */}
                      {q.videoUrl && (
                        <div className="rounded-xl border border-purple-200/60 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
                          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            <Video className="h-3.5 w-3.5" />
                            Video Pembahasan
                          </p>
                          <div className="aspect-video overflow-hidden rounded-lg">
                            <iframe
                              src={q.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Video Pembahasan"
                            />
                          </div>
                        </div>
                      )}

                      {/* Discussion Forum */}
                      <QuestionDiscussion questionId={q.id} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Empty state when filter yields no results at all */}
          {data.sections.every((section) => {
            const filtered =
              reviewFilter === "all"
                ? section.questions
                : section.questions.filter((q) => getQuestionFilterCategory(q) === reviewFilter);
            return filtered.length === 0;
          }) && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
              <MinusCircle className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Tidak ada soal dengan filter ini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-3 pb-4 sm:flex-row sm:justify-center">
        <Button variant="outline" className="w-full rounded-full sm:w-auto" asChild>
          <Link href="/dashboard/tryout">
            <RotateCcw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Link>
        </Button>
        {activeTab === "summary" && (
          <Button className="w-full rounded-full sm:w-auto" onClick={() => setActiveTab("review")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Lihat Pembahasan
          </Button>
        )}
        <Button variant="outline" className="w-full rounded-full sm:w-auto" asChild>
          <Link href="/dashboard/analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Lihat Analitik
          </Link>
        </Button>
      </div>

      {/* CTA — Apa Selanjutnya? */}
      <div className="pb-8">
        <p className="mb-4 text-base font-semibold">Apa Selanjutnya?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Ulangi Try Out */}
          <Link
            href="/dashboard/tryout"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
              <RotateCcw className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Ulangi Try Out</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Coba kembali dan tingkatkan skor</p>
            </div>
          </Link>

          {/* Lihat Leaderboard */}
          <Link
            href="/dashboard/leaderboard"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
              <Trophy className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Lihat Leaderboard</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Bandingkan skor dengan peserta lain</p>
            </div>
          </Link>

          {/* Mode Latihan */}
          <Link
            href="/dashboard/practice"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
              <BookOpen className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Mode Latihan</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Latihan soal tanpa batas waktu</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
