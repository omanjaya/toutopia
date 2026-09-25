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
  Keyboard,
  Check,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { useAntiCheat } from "@/shared/hooks/use-anti-cheat";
import { cn } from "@/shared/lib/utils";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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

interface ExamSessionProps {
  attemptId: string;
}

type SaveStatus = "idle" | "saving" | "saved";

function isQuestionAnswered(q: Question): boolean {
  return (
    !!q.selectedOptionId ||
    q.selectedOptions.length > 0 ||
    q.numericAnswer !== null
  );
}

export function ExamSession({ attemptId }: ExamSessionProps) {
  const router = useRouter();
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  // Mobile: question grid overlay
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionTimeRef = useRef(0);
  const handleSubmitRef = useRef<() => void>(() => {});
  const selectOptionRef = useRef<(optionId: string) => void>(() => {});
  const toggleFlagRef = useRef<() => void>(() => {});
  const navigateQuestionRef = useRef<(sIdx: number, qIdx: number) => void>(() => {});

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
    async function fetchExam() {
      try {
        const response = await fetch(`/api/exam/${attemptId}`);
        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error?.message ?? "Gagal memuat ujian");
          router.push("/dashboard/tryout");
          return;
        }

        if (result.data.status !== "IN_PROGRESS") {
          router.push(`/exam/${attemptId}/result`);
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
        router.push("/dashboard/tryout");
      } finally {
        setLoading(false);
      }
    }

    fetchExam();
  }, [attemptId, router]);

  // Timer
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

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent): void {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key.toLowerCase();

      // Option selection: 1-5 or a-e
      const numKeys = ["1", "2", "3", "4", "5"];
      const letterKeys = ["a", "b", "c", "d", "e"];
      const numIdx = numKeys.indexOf(key);
      const letterIdx = letterKeys.indexOf(key);
      const optionIdx = numIdx >= 0 ? numIdx : letterIdx;

      if (
        optionIdx >= 0 &&
        currentQuestionRef.current &&
        optionIdx < currentQuestionRef.current.options.length
      ) {
        selectOptionRef.current(currentQuestionRef.current.options[optionIdx].id);
        return;
      }

      // Navigation
      if (key === "arrowleft" || key === "arrowup") {
        e.preventDefault();
        if (currentQuestionIdxRef.current > 0) {
          navigateQuestionRef.current(
            currentSectionIdxRef.current,
            currentQuestionIdxRef.current - 1
          );
        } else if (currentSectionIdxRef.current > 0 && examDataRef.current) {
          const prevSection =
            examDataRef.current.sections[currentSectionIdxRef.current - 1];
          navigateQuestionRef.current(
            currentSectionIdxRef.current - 1,
            prevSection.questions.length - 1
          );
        }
        return;
      }

      if (key === "arrowright" || key === "arrowdown") {
        e.preventDefault();
        if (
          examDataRef.current &&
          currentSectionRef.current &&
          currentQuestionIdxRef.current <
            currentSectionRef.current.questions.length - 1
        ) {
          navigateQuestionRef.current(
            currentSectionIdxRef.current,
            currentQuestionIdxRef.current + 1
          );
        } else if (
          examDataRef.current &&
          currentSectionIdxRef.current <
            examDataRef.current.sections.length - 1
        ) {
          navigateQuestionRef.current(currentSectionIdxRef.current + 1, 0);
        }
        return;
      }

      // Flag
      if (key === "f" && !e.ctrlKey && !e.metaKey) {
        toggleFlagRef.current();
        return;
      }

      // Submit
      if (key === "enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowConfirmSubmit(true);
        return;
      }
    }

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSection = examData?.sections[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQuestionIdx];

  // Keep refs in sync for keyboard handler
  const currentQuestionRef = useRef(currentQuestion);
  const currentSectionRef = useRef(currentSection);
  const currentQuestionIdxRef = useRef(currentQuestionIdx);
  const currentSectionIdxRef = useRef(currentSectionIdx);
  const examDataRef = useRef(examData);

  currentQuestionRef.current = currentQuestion;
  currentSectionRef.current = currentSection;
  currentQuestionIdxRef.current = currentQuestionIdx;
  currentSectionIdxRef.current = currentSectionIdx;
  examDataRef.current = examData;
  handleSubmitRef.current = handleSubmit;
  selectOptionRef.current = selectOption;
  toggleFlagRef.current = toggleFlag;
  navigateQuestionRef.current = navigateQuestion;

  const allQuestions = examData?.sections.flatMap((s) => s.questions) ?? [];
  const answeredCount = allQuestions.filter(isQuestionAnswered).length;
  const flaggedCount = allQuestions.filter((q) => q.isFlagged).length;
  const unansweredCount = allQuestions.length - answeredCount;
  const progressPercent =
    allQuestions.length > 0
      ? Math.round((answeredCount / allQuestions.length) * 100)
      : 0;

  // Global question index for mobile "3/20" display
  let globalQuestionIdx = 0;
  if (examData) {
    for (let s = 0; s < currentSectionIdx; s++) {
      globalQuestionIdx += examData.sections[s].questions.length;
    }
    globalQuestionIdx += currentQuestionIdx + 1;
  }

  // Find the first unanswered question across all sections in order
  function findFirstUnanswered(): { sIdx: number; qIdx: number } | null {
    if (!examData) return null;
    for (let sIdx = 0; sIdx < examData.sections.length; sIdx++) {
      const section = examData.sections[sIdx];
      for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
        if (!isQuestionAnswered(section.questions[qIdx])) {
          return { sIdx, qIdx };
        }
      }
    }
    return null;
  }

  // Save answer with debounce + save status tracking
  const saveAnswer = useCallback(
    async (question: Question) => {
      setSaveStatus("saving");
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
            timeSpentSeconds: question.timeSpentSeconds + questionTimeRef.current,
          }),
        });
        setSaveStatus("saved");
        if (saveStatusTimerRef.current)
          clearTimeout(saveStatusTimerRef.current);
        saveStatusTimerRef.current = setTimeout(
          () => setSaveStatus("idle"),
          2000
        );
      } catch {
        // Silent fail — will retry on next save
        setSaveStatus("idle");
      }
    },
    [attemptId]
  );

  function debouncedSave(question: Question) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveAnswer(question), 500);
  }

  function selectOption(optionId: string) {
    if (!examData || !currentQuestion) return;

    const updated = {
      ...examData,
      sections: examData.sections.map((section, sIdx) =>
        sIdx === currentSectionIdx
          ? {
              ...section,
              questions: section.questions.map((q, qIdx) => {
                if (qIdx !== currentQuestionIdx) return q;
                if (q.type === "SINGLE_CHOICE" || q.type === "TRUE_FALSE") {
                  return { ...q, selectedOptionId: q.selectedOptionId === optionId ? null : optionId };
                } else if (q.type === "MULTIPLE_CHOICE") {
                  const idx = q.selectedOptions.indexOf(optionId);
                  return {
                    ...q,
                    selectedOptions: idx >= 0
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
    debouncedSave(updated.sections[currentSectionIdx].questions[currentQuestionIdx]);
  }

  function toggleFlag() {
    if (!examData || !currentQuestion) return;

    const updated = {
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
    debouncedSave(updated.sections[currentSectionIdx].questions[currentQuestionIdx]);
  }

  function navigateQuestion(sectionIdx: number, questionIdx: number) {
    // Save current question time
    if (currentQuestion && examData) {
      const timeSpent = questionTimeRef.current;
      const updated = {
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
      saveAnswer(updated.sections[currentSectionIdx].questions[currentQuestionIdx]);
    }

    questionTimeRef.current = 0;
    setCurrentSectionIdx(sectionIdx);
    setCurrentQuestionIdx(questionIdx);
    setShowQuestionGrid(false);
  }

  async function handleSubmit() {
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
      router.push(`/exam/${attemptId}/result`);
    } catch {
      toast.error("Gagal mengirim jawaban");
      setIsSubmitting(false);
    }
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!examData || !currentSection || !currentQuestion) {
    return (
      <div className="flex h-dvh items-center justify-center px-6">
        <p className="text-center text-muted-foreground">Data ujian tidak ditemukan</p>
      </div>
    );
  }

  const isTimeWarning = timeLeft < 300; // 5 minutes
  const isFirstQuestion = currentSectionIdx === 0 && currentQuestionIdx === 0;
  const isLastQuestion =
    currentSectionIdx === examData.sections.length - 1 &&
    currentQuestionIdx === currentSection.questions.length - 1;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top Bar */}
      <div className="shrink-0 border-b">
        {/* Mobile top bar */}
        <div className="flex h-12 items-center justify-between px-3 md:hidden">
          <p className="max-w-[30%] truncate text-xs font-medium text-muted-foreground">
            {currentSection.title}
          </p>
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-sm font-bold",
              isTimeWarning
                ? "animate-pulse bg-destructive/10 text-destructive"
                : "bg-muted text-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowQuestionGrid(true)}
            className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            {globalQuestionIdx}/{allQuestions.length}
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="hidden items-center justify-between px-4 py-2 md:flex">
          <div>
            <h1 className="font-semibold">{examData.packageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {currentSection.title}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Answered count + save status + flagged indicator */}
            <div className="flex items-center gap-1.5">
              {saveStatus === "saving" && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
              {saveStatus === "saved" && (
                <Check className="h-3 w-3 text-emerald-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{allQuestions.length} dijawab
              </span>
              {flaggedCount > 0 && (
                <span
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white"
                  title={`${flaggedCount} soal ditandai`}
                >
                  {flaggedCount}
                </span>
              )}
            </div>

            {/* Jump to first unanswered */}
            {unansweredCount > 0 && (
              <button
                onClick={() => {
                  const target = findFirstUnanswered();
                  if (target) navigateQuestion(target.sIdx, target.qIdx);
                }}
                className="flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/40 px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
              >
                Lanjut Belum Dijawab
                <ChevronRight className="h-3 w-3" />
              </button>
            )}

            {violationCount > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
                <ShieldAlert className="h-4 w-4" />
                {violationCount} pelanggaran
              </div>
            )}
            <div
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 font-mono text-lg font-bold",
                isTimeWarning
                  ? "animate-pulse bg-destructive/10 text-destructive"
                  : "bg-muted"
              )}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirmSubmit(true)}
            >
              <Send className="mr-2 h-4 w-4" />
              Selesai
            </Button>
          </div>
        </div>

        {/* Violation indicator — mobile */}
        {violationCount > 0 && (
          <div className="flex items-center justify-center gap-1 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive md:hidden">
            <ShieldAlert className="h-3.5 w-3.5" />
            {violationCount} pelanggaran terdeteksi
          </div>
        )}

        {/* Full-width progress bar */}
        <div className="h-1.5 w-full bg-muted">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Navigation Sidebar — desktop only */}
        <div className="hidden w-64 shrink-0 overflow-y-auto border-r p-3 md:block">
          {examData.sections.map((section, sIdx) => {
            const sectionAnswered = section.questions.filter(isQuestionAnswered).length;
            const sectionTotal = section.questions.length;
            const sectionPercent =
              sectionTotal > 0
                ? Math.round((sectionAnswered / sectionTotal) * 100)
                : 0;

            return (
              <div key={section.id} className="mb-4">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {section.title}
                </p>
                {/* Per-section progress */}
                <div className="mb-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {sectionAnswered}/{sectionTotal} dijawab
                  </p>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${sectionPercent}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {section.questions.map((q, qIdx) => {
                    const isActive =
                      sIdx === currentSectionIdx && qIdx === currentQuestionIdx;
                    const isAnswered = isQuestionAnswered(q);

                    return (
                      <button
                        key={q.id}
                        onClick={() => navigateQuestion(sIdx, qIdx)}
                        className={cn(
                          "relative flex h-9 w-9 items-center justify-center rounded text-xs font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isAnswered
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {qIdx + 1}
                        {q.isFlagged && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Mobile: question content area */}
          <div className="px-4 py-4 md:p-6">
            <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs md:text-sm">
                  Soal {currentQuestionIdx + 1} dari{" "}
                  {currentSection.questions.length}
                </Badge>
                <Button
                  variant={currentQuestion.isFlagged ? "default" : "outline"}
                  size="sm"
                  onClick={toggleFlag}
                  className={cn(
                    "h-9 min-w-[80px]",
                    currentQuestion.isFlagged ? "bg-amber-500 hover:bg-amber-600" : ""
                  )}
                >
                  <Flag className="mr-1.5 h-4 w-4" />
                  {currentQuestion.isFlagged ? "Ditandai" : "Tandai"}
                </Button>
              </div>

              {/* Question Content */}
              <div className={cardCls}>
                <div className="p-4 md:p-6">
                  <MathRenderer
                    content={currentQuestion.content}
                    className="prose prose-sm max-w-none break-words text-base leading-relaxed dark:prose-invert [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:overflow-x-auto md:text-base"
                  />
                  {currentQuestion.imageUrl && (
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Gambar soal"
                      className="mt-4 max-h-52 max-w-full rounded-lg md:max-h-64"
                    />
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5 md:space-y-3">
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
                        "flex w-full min-h-[52px] items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
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

              {/* Navigation — desktop */}
              <div className="hidden items-center justify-between pt-4 md:flex">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentQuestionIdx > 0) {
                      navigateQuestion(currentSectionIdx, currentQuestionIdx - 1);
                    } else if (currentSectionIdx > 0) {
                      const prevSection = examData.sections[currentSectionIdx - 1];
                      navigateQuestion(
                        currentSectionIdx - 1,
                        prevSection.questions.length - 1
                      );
                    }
                  }}
                  disabled={isFirstQuestion}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Sebelumnya
                </Button>
                <Button
                  onClick={() => {
                    if (currentQuestionIdx < currentSection.questions.length - 1) {
                      navigateQuestion(currentSectionIdx, currentQuestionIdx + 1);
                    } else if (currentSectionIdx < examData.sections.length - 1) {
                      navigateQuestion(currentSectionIdx + 1, 0);
                    }
                  }}
                  disabled={isLastQuestion}
                >
                  Selanjutnya
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* pb-24 on mobile for bottom bar clearance */}
              <div className="pb-24 md:pb-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar — mobile only */}
      <div className="flex h-14 shrink-0 items-center justify-between border-t bg-background px-3 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (currentQuestionIdx > 0) {
              navigateQuestion(currentSectionIdx, currentQuestionIdx - 1);
            } else if (currentSectionIdx > 0) {
              const prevSection = examData.sections[currentSectionIdx - 1];
              navigateQuestion(
                currentSectionIdx - 1,
                prevSection.questions.length - 1
              );
            }
          }}
          disabled={isFirstQuestion}
          className="h-10 gap-1 px-3 text-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

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
            onClick={() => {
              if (currentQuestionIdx < currentSection.questions.length - 1) {
                navigateQuestion(currentSectionIdx, currentQuestionIdx + 1);
              } else if (currentSectionIdx < examData.sections.length - 1) {
                navigateQuestion(currentSectionIdx + 1, 0);
              }
            }}
            className="h-10 gap-1 px-3 text-xs"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Question Grid Overlay — mobile only */}
      {showQuestionGrid && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm md:hidden">
          <div className="flex h-12 items-center justify-between border-b px-4">
            <h2 className="text-sm font-semibold">Navigasi Soal</h2>
            <button
              onClick={() => setShowQuestionGrid(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
              <span className="text-[10px] text-muted-foreground">Ditandai</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {examData.sections.map((section, sIdx) => (
              <div key={section.id} className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {section.questions.map((q, qIdx) => {
                    const isActive =
                      sIdx === currentSectionIdx && qIdx === currentQuestionIdx;
                    const isAnswered = isQuestionAnswered(q);

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

          <div className="border-t p-4">
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

      {/* Anti-Cheat Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className={cn(cardCls, "w-full max-w-[calc(100vw-2rem)] border border-destructive sm:max-w-md")}>
            <div className="space-y-4 p-5 md:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                  </div>
                  <h3 className="text-base font-semibold text-destructive md:text-lg">
                    Peringatan Anti-Cheat
                  </h3>
                </div>
                <button
                  onClick={dismissWarning}
                  className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm">{warningMessage}</p>
              <p className="text-xs text-muted-foreground">
                Tetap di tab ini selama ujian berlangsung. Berpindah tab,
                membuka aplikasi lain, atau mencoba menyalin konten dianggap
                pelanggaran.
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
        </div>
      )}

      {/* Keyboard Shortcuts Help — desktop only */}
      <div className="fixed bottom-4 right-4 z-40 hidden md:block">
        <div className="group relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted hover:text-foreground">
            <Keyboard className="h-4 w-4" />
          </div>
          <div className="absolute bottom-12 right-0 hidden w-56 rounded-xl border bg-popover p-3 shadow-lg group-hover:block">
            <p className="mb-2 text-xs font-semibold text-foreground">
              Pintasan Keyboard
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Pilih opsi</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  1-5
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Soal sebelumnya</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  &larr;
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Soal berikutnya</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  &rarr;
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Tandai soal</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  F
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Selesaikan</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  &#8984;&#8629;
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className={cn(
            cardCls,
            "w-full max-w-[calc(100vw-2rem)] rounded-t-2xl pb-8 sm:max-w-md sm:rounded-2xl sm:pb-0"
          )}>
            <div className="space-y-4 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold">Selesaikan Ujian?</h3>
              </div>

              {/* Per-section breakdown */}
              <div className="space-y-2">
                {examData.sections.map((section, sIdx) => {
                  const sectionAnswered = section.questions.filter(isQuestionAnswered).length;
                  const sectionTotal = section.questions.length;
                  const hasUnanswered = sectionAnswered < sectionTotal;

                  return (
                    <div
                      key={section.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                        hasUnanswered
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {hasUnanswered ? (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        )}
                        <span className="font-medium">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "tabular-nums",
                            hasUnanswered
                              ? "text-amber-700 dark:text-amber-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {sectionAnswered}/{sectionTotal}
                        </span>
                        {hasUnanswered && (
                          <button
                            onClick={() => {
                              setShowConfirmSubmit(false);
                              const firstUnansweredIdx = section.questions.findIndex(
                                (q) => !isQuestionAnswered(q)
                              );
                              if (firstUnansweredIdx !== -1) {
                                navigateQuestion(sIdx, firstUnansweredIdx);
                              }
                            }}
                            className="text-xs underline underline-offset-2 hover:no-underline"
                          >
                            Kembali ke soal
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1 text-sm">
                {flaggedCount > 0 && (
                  <p className="text-amber-500">
                    {flaggedCount} soal masih ditandai
                  </p>
                )}
                <p className="text-muted-foreground">
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
        </div>
      )}
    </div>
  );
}
