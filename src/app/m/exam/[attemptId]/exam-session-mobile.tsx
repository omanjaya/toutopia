"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  ShieldAlert,
  X,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { useAntiCheat } from "@/shared/hooks/use-anti-cheat";
import { cn } from "@/shared/lib/utils";

interface Option {
  id: string;
  label: string;
  content: string;
  imageUrl: string | null;
  order: number;
}

interface Question {
  id: string;
  content: string;
  type: string;
  imageUrl: string | null;
  options: Option[];
  selectedOptionId: string | null;
  selectedOptions: string[];
  numericAnswer: number | null;
  isFlagged: boolean;
  timeSpentSeconds: number;
}

interface Section {
  id: string;
  title: string;
  subjectName: string;
  durationMinutes: number;
  questions: Question[];
}

interface ExamData {
  id: string;
  status: string;
  packageTitle: string;
  isAntiCheat: boolean;
  serverDeadline: string;
  violations: number;
  sections: Section[];
}

interface ExamSessionMobileProps {
  attemptId: string;
}

export function ExamSessionMobile({ attemptId }: ExamSessionMobileProps) {
  const router = useRouter();
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionTimeRef = useRef(0);
  const handleSubmitRef = useRef<() => void>(() => {});

  // Anti-cheat system
  const {
    violationCount,
    showWarning,
    warningMessage,
    dismissWarning,
  } = useAntiCheat({
    attemptId,
    enabled: examData?.isAntiCheat ?? false,
    onMaxViolations: () => {
      toast.error("Terlalu banyak pelanggaran. Ujian akan diselesaikan.");
      handleSubmit();
    },
  });

  // Fetch exam data
  useEffect(() => {
    async function fetchExam(): Promise<void> {
      try {
        const response = await fetch(`/api/exam/${attemptId}`);
        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error?.message ?? "Gagal memuat ujian");
          router.push("/m/dashboard");
          return;
        }

        if (result.data.status !== "IN_PROGRESS") {
          router.push(`/m/exam/${attemptId}/result`);
          return;
        }

        setExamData(result.data);

        const deadline = new Date(result.data.serverDeadline).getTime();
        const remaining = Math.max(
          0,
          Math.floor((deadline - Date.now()) / 1000)
        );
        setTimeLeft(remaining);
      } catch {
        toast.error("Gagal memuat data ujian");
        router.push("/m/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchExam();
  }, [attemptId, router]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || !examData) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
      questionTimeRef.current += 1;
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft > 0, examData]);

  const currentSection = examData?.sections[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQuestionIdx];

  const examDataRef = useRef(examData);
  examDataRef.current = examData;
  handleSubmitRef.current = handleSubmit;

  const allQuestions = examData?.sections.flatMap((s) => s.questions) ?? [];
  const answeredCount = allQuestions.filter(
    (q) =>
      q.selectedOptionId ||
      q.selectedOptions.length > 0 ||
      q.numericAnswer !== null
  ).length;
  const flaggedCount = allQuestions.filter((q) => q.isFlagged).length;
  const unansweredCount = allQuestions.length - answeredCount;

  // Compute global question index for "3/20" display
  let globalQuestionIdx = 0;
  if (examData) {
    for (let s = 0; s < currentSectionIdx; s++) {
      globalQuestionIdx += examData.sections[s].questions.length;
    }
    globalQuestionIdx += currentQuestionIdx + 1;
  }

  // Save answer
  const saveAnswer = useCallback(
    async (question: Question): Promise<void> => {
      try {
        await fetch(`/api/exam/${attemptId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            selectedOptionId: question.selectedOptionId,
            selectedOptions: question.selectedOptions,
            numericAnswer: question.numericAnswer,
            isFlagged: question.isFlagged,
            timeSpentSeconds:
              question.timeSpentSeconds + questionTimeRef.current,
          }),
        });
      } catch {
        // Silent fail — will retry on next save
      }
    },
    [attemptId]
  );

  function debouncedSave(question: Question): void {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveAnswer(question), 500);
  }

  function selectOption(optionId: string): void {
    if (!examData || !currentQuestion) return;

    const updated: ExamData = {
      ...examData,
      sections: examData.sections.map((section, sIdx) =>
        sIdx === currentSectionIdx
          ? {
              ...section,
              questions: section.questions.map((q, qIdx) => {
                if (qIdx !== currentQuestionIdx) return q;
                if (q.type === "SINGLE_CHOICE" || q.type === "TRUE_FALSE") {
                  return {
                    ...q,
                    selectedOptionId:
                      q.selectedOptionId === optionId ? null : optionId,
                  };
                } else if (q.type === "MULTIPLE_CHOICE") {
                  const idx = q.selectedOptions.indexOf(optionId);
                  return {
                    ...q,
                    selectedOptions:
                      idx >= 0
                        ? q.selectedOptions.filter((id) => id !== optionId)
                        : [...q.selectedOptions, optionId],
                  };
                }
                return q;
              }),
            }
          : section
      ),
    };

    setExamData(updated);
    debouncedSave(
      updated.sections[currentSectionIdx].questions[currentQuestionIdx]
    );
  }

  function toggleFlag(): void {
    if (!examData || !currentQuestion) return;

    const updated: ExamData = {
      ...examData,
      sections: examData.sections.map((section, sIdx) =>
        sIdx === currentSectionIdx
          ? {
              ...section,
              questions: section.questions.map((q, qIdx) =>
                qIdx === currentQuestionIdx
                  ? { ...q, isFlagged: !q.isFlagged }
                  : q
              ),
            }
          : section
      ),
    };

    setExamData(updated);
    debouncedSave(
      updated.sections[currentSectionIdx].questions[currentQuestionIdx]
    );
  }

  function navigateQuestion(sectionIdx: number, questionIdx: number): void {
    // Save current question time
    if (currentQuestion && examData) {
      const timeSpent = questionTimeRef.current;
      const updated: ExamData = {
        ...examData,
        sections: examData.sections.map((section, sIdx) =>
          sIdx === currentSectionIdx
            ? {
                ...section,
                questions: section.questions.map((q, qIdx) =>
                  qIdx === currentQuestionIdx
                    ? { ...q, timeSpentSeconds: q.timeSpentSeconds + timeSpent }
                    : q
                ),
              }
            : section
        ),
      };
      setExamData(updated);
      saveAnswer(
        updated.sections[currentSectionIdx].questions[currentQuestionIdx]
      );
    }

    questionTimeRef.current = 0;
    setCurrentSectionIdx(sectionIdx);
    setCurrentQuestionIdx(questionIdx);
    setShowQuestionGrid(false);
  }

  function goToPreviousQuestion(): void {
    if (currentQuestionIdx > 0) {
      navigateQuestion(currentSectionIdx, currentQuestionIdx - 1);
    } else if (currentSectionIdx > 0 && examData) {
      const prevSection = examData.sections[currentSectionIdx - 1];
      navigateQuestion(currentSectionIdx - 1, prevSection.questions.length - 1);
    }
  }

  function goToNextQuestion(): void {
    if (!examData || !currentSection) return;
    if (currentQuestionIdx < currentSection.questions.length - 1) {
      navigateQuestion(currentSectionIdx, currentQuestionIdx + 1);
    } else if (currentSectionIdx < examData.sections.length - 1) {
      navigateQuestion(currentSectionIdx + 1, 0);
    }
  }

  const isFirstQuestion =
    currentSectionIdx === 0 && currentQuestionIdx === 0;
  const isLastQuestion =
    examData !== null &&
    currentSection !== undefined &&
    currentSectionIdx === examData.sections.length - 1 &&
    currentQuestionIdx === currentSection.questions.length - 1;

  async function handleSubmit(): Promise<void> {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Save current answer first
    if (currentQuestion) {
      await saveAnswer(currentQuestion);
    }

    try {
      const response = await fetch(`/api/exam/${attemptId}/submit`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal mengirim jawaban");
        setIsSubmitting(false);
        return;
      }

      toast.success("Ujian berhasil diselesaikan!");
      router.push(`/m/exam/${attemptId}/result`);
    } catch {
      toast.error("Gagal mengirim jawaban");
      setIsSubmitting(false);
    }
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No data state
  if (!examData || !currentSection || !currentQuestion) {
    return (
      <div className="flex h-dvh items-center justify-center px-6">
        <p className="text-center text-muted-foreground">
          Data ujian tidak ditemukan
        </p>
      </div>
    );
  }

  const isTimeWarning = timeLeft < 300;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top Bar — fixed h-12 */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-3 safe-top">
        {/* Left: section name truncated */}
        <p className="max-w-[30%] truncate text-xs font-medium text-muted-foreground">
          {currentSection.title}
        </p>

        {/* Center: timer */}
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-sm font-bold",
            isTimeWarning
              ? "bg-destructive/10 text-destructive animate-pulse"
              : "bg-muted text-foreground"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {formatTime(timeLeft)}
        </div>

        {/* Right: question indicator — tappable to open grid */}
        <button
          onClick={() => setShowQuestionGrid(true)}
          className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums"
        >
          <Grid3X3 className="h-3.5 w-3.5" />
          {globalQuestionIdx}/{allQuestions.length}
        </button>
      </div>

      {/* Violation indicator */}
      {violationCount > 0 && (
        <div className="flex items-center justify-center gap-1 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
          <ShieldAlert className="h-3.5 w-3.5" />
          {violationCount} pelanggaran terdeteksi
        </div>
      )}

      {/* Main Content — scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4">
        {/* Question content */}
        <div className="space-y-4">
          <MathRenderer
            content={currentQuestion.content}
            className="prose prose-sm max-w-none text-base leading-relaxed break-words dark:prose-invert [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:overflow-x-auto"
          />

          {currentQuestion.imageUrl && (
            <img
              src={currentQuestion.imageUrl}
              alt="Gambar soal"
              className="max-h-52 max-w-full rounded-lg"
            />
          )}

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options.map((option) => {
              const isSelected =
                currentQuestion.type === "MULTIPLE_CHOICE"
                  ? currentQuestion.selectedOptions.includes(option.id)
                  : currentQuestion.selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => selectOption(option.id)}
                  className={cn(
                    "flex w-full min-h-14 items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all active:scale-[0.98]",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <MathRenderer
                      content={option.content}
                      className="text-sm leading-relaxed"
                    />
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt={`Opsi ${option.label}`}
                        className="mt-2 max-h-40 max-w-full rounded-lg"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar — fixed h-14 */}
      <div className="flex h-14 shrink-0 items-center justify-between border-t bg-background px-3 safe-bottom">
        {/* Left: Previous */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          className="h-10 gap-1 px-3 text-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        {/* Center: Flag button */}
        <Button
          variant={currentQuestion.isFlagged ? "default" : "ghost"}
          size="icon"
          onClick={toggleFlag}
          className={cn(
            "h-10 w-10",
            currentQuestion.isFlagged && "bg-amber-500 hover:bg-amber-600"
          )}
        >
          <Flag className="h-4 w-4" />
        </Button>

        {/* Right: Next or Submit */}
        {isLastQuestion ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmSubmit(true)}
            className="h-10 gap-1 px-3 text-xs"
          >
            Selesai
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextQuestion}
            className="h-10 gap-1 px-3 text-xs"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Question Grid Overlay */}
      {showQuestionGrid && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
          {/* Grid header */}
          <div className="flex h-12 items-center justify-between border-b px-4">
            <h2 className="text-sm font-semibold">Navigasi Soal</h2>
            <button
              onClick={() => setShowQuestionGrid(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 border-b px-4 py-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              Dijawab
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              Ditandai
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-muted" />
              Belum dijawab
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-px border-b bg-border">
            <div className="flex flex-col items-center bg-background py-2.5">
              <span className="text-lg font-bold text-emerald-600 tabular-nums">
                {answeredCount}
              </span>
              <span className="text-[10px] text-muted-foreground">Dijawab</span>
            </div>
            <div className="flex flex-col items-center bg-background py-2.5">
              <span className="text-lg font-bold text-muted-foreground tabular-nums">
                {unansweredCount}
              </span>
              <span className="text-[10px] text-muted-foreground">Belum</span>
            </div>
            <div className="flex flex-col items-center bg-background py-2.5">
              <span className="text-lg font-bold text-amber-500 tabular-nums">
                {flaggedCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Ditandai
              </span>
            </div>
          </div>

          {/* Grid content */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {examData.sections.map((section, sIdx) => (
              <div key={section.id} className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {section.questions.map((q, qIdx) => {
                    const isActive =
                      sIdx === currentSectionIdx &&
                      qIdx === currentQuestionIdx;
                    const isAnswered =
                      !!q.selectedOptionId ||
                      q.selectedOptions.length > 0 ||
                      q.numericAnswer !== null;

                    return (
                      <button
                        key={q.id}
                        onClick={() => navigateQuestion(sIdx, qIdx)}
                        className={cn(
                          "relative flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all active:scale-95",
                          isActive
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                            : isAnswered
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {qIdx + 1}
                        {q.isFlagged && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-background" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Grid footer: Selesai button */}
          <div className="border-t p-4 safe-bottom">
            <Button
              variant="destructive"
              className="h-12 w-full text-sm"
              onClick={() => {
                setShowQuestionGrid(false);
                setShowConfirmSubmit(true);
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Selesaikan Ujian
            </Button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-[calc(100vw-2rem)] rounded-t-2xl bg-background p-5 pb-8 safe-bottom sm:max-w-md sm:rounded-2xl sm:pb-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold">Selesaikan Ujian?</h3>
            </div>

            <div className="mb-5 space-y-2 text-sm">
              <p>
                <span className="font-medium text-emerald-600">
                  {answeredCount}
                </span>{" "}
                dari {allQuestions.length} soal dijawab
              </p>
              {unansweredCount > 0 && (
                <p className="text-destructive">
                  {unansweredCount} soal belum dijawab
                </p>
              )}
              {flaggedCount > 0 && (
                <p className="text-amber-600">
                  {flaggedCount} soal masih ditandai
                </p>
              )}
              <p className="pt-1 text-muted-foreground">
                Setelah diselesaikan, Anda tidak bisa mengubah jawaban.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 flex-1"
                onClick={() => setShowConfirmSubmit(false)}
              >
                Kembali
              </Button>
              <Button
                variant="destructive"
                className="h-12 flex-1"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Selesaikan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[calc(100vw-2rem)] rounded-2xl border border-destructive bg-background p-5 sm:max-w-sm">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-base font-semibold text-destructive">
                  Peringatan
                </h3>
              </div>
              <button
                onClick={dismissWarning}
                className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <p className="mb-2 text-sm">{warningMessage}</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Tetap di tab ini selama ujian berlangsung. Berpindah tab atau
              membuka aplikasi lain dianggap pelanggaran.
            </p>
            <Button
              className="h-12 w-full"
              variant="destructive"
              onClick={dismissWarning}
            >
              Saya Mengerti
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
