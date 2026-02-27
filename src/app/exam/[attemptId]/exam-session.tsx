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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
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

interface ExamSessionProps {
  attemptId: string;
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Keyboard shortcuts
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
  const answeredCount = allQuestions.filter(
    (q) =>
      q.selectedOptionId ||
      q.selectedOptions.length > 0 ||
      q.numericAnswer !== null
  ).length;
  const flaggedCount = allQuestions.filter((q) => q.isFlagged).length;

  // Save answer with debounce
  const saveAnswer = useCallback(
    async (question: Question) => {
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
      } catch {
        // Silent fail — will retry on next save
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
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!examData || !currentSection || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Data ujian tidak ditemukan</p>
      </div>
    );
  }

  const isTimeWarning = timeLeft < 300; // 5 minutes

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div>
          <h1 className="font-semibold">{examData.packageTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {currentSection.title}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {answeredCount}/{allQuestions.length} dijawab
            {flaggedCount > 0 && (
              <span className="ml-2 text-amber-500">
                {flaggedCount} ditandai
              </span>
            )}
          </div>
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
                ? "bg-destructive/10 text-destructive animate-pulse"
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

      <div className="flex flex-1 overflow-hidden">
        {/* Question Navigation Sidebar */}
        <div className="w-64 shrink-0 overflow-y-auto border-r p-3">
          {examData.sections.map((section, sIdx) => (
            <div key={section.id} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {section.title}
              </p>
              <div className="grid grid-cols-5 gap-1">
                {section.questions.map((q, qIdx) => {
                  const isActive =
                    sIdx === currentSectionIdx && qIdx === currentQuestionIdx;
                  const isAnswered =
                    !!q.selectedOptionId ||
                    q.selectedOptions.length > 0 ||
                    q.numericAnswer !== null;

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
          ))}
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Soal {currentQuestionIdx + 1} dari{" "}
                {currentSection.questions.length}
              </Badge>
              <Button
                variant={currentQuestion.isFlagged ? "default" : "outline"}
                size="sm"
                onClick={toggleFlag}
                className={
                  currentQuestion.isFlagged ? "bg-amber-500 hover:bg-amber-600" : ""
                }
              >
                <Flag className="mr-2 h-4 w-4" />
                {currentQuestion.isFlagged ? "Ditandai" : "Tandai"}
              </Button>
            </div>

            {/* Question Content */}
            <Card>
              <CardContent className="pt-6">
                <MathRenderer
                  content={currentQuestion.content}
                  className="prose prose-sm max-w-none dark:prose-invert"
                />
                {currentQuestion.imageUrl && (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Gambar soal"
                    className="mt-4 max-h-64 rounded-lg"
                  />
                )}
              </CardContent>
            </Card>

            {/* Options */}
            <div className="space-y-3">
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
                      "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/30 hover:bg-muted/50"
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
                    <div className="flex-1 pt-1">
                      <MathRenderer
                        content={option.content}
                        className="text-sm"
                      />
                      {option.imageUrl && (
                        <img
                          src={option.imageUrl}
                          alt={`Opsi ${option.label}`}
                          className="mt-2 max-h-48 rounded-lg"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
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
                disabled={currentSectionIdx === 0 && currentQuestionIdx === 0}
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
                disabled={
                  currentSectionIdx === examData.sections.length - 1 &&
                  currentQuestionIdx === currentSection.questions.length - 1
                }
              >
                Selanjutnya
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Cheat Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md border-destructive">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold text-destructive">
                    Peringatan Anti-Cheat
                  </h3>
                </div>
                <button
                  onClick={dismissWarning}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm">{warningMessage}</p>
              <p className="text-xs text-muted-foreground">
                Tetap di tab ini selama ujian berlangsung. Berpindah tab, membuka
                aplikasi lain, atau mencoba menyalin konten dianggap pelanggaran.
              </p>
              <Button
                className="w-full"
                variant="destructive"
                onClick={dismissWarning}
              >
                Saya Mengerti
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 z-40">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-lg font-semibold">Selesaikan Ujian?</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  {answeredCount} dari {allQuestions.length} soal dijawab
                </p>
                {allQuestions.length - answeredCount > 0 && (
                  <p className="text-destructive">
                    {allQuestions.length - answeredCount} soal belum dijawab
                  </p>
                )}
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
                  className="flex-1"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Kembali
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
