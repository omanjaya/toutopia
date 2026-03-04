"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAntiCheat } from "@/shared/hooks/use-anti-cheat";

// ---------------------------------------------------------------------------
// Shared type definitions
// ---------------------------------------------------------------------------

export interface ExamSessionOption {
  id: string;
  label: string;
  content: string;
  imageUrl: string | null;
  order: number;
}

export interface ExamSessionQuestion {
  id: string;
  content: string;
  type: string;
  imageUrl: string | null;
  options: ExamSessionOption[];
  selectedOptionId: string | null;
  selectedOptions: string[];
  numericAnswer: number | null;
  isFlagged: boolean;
  timeSpentSeconds: number;
}

export interface ExamSessionSection {
  id: string;
  title: string;
  subjectName: string;
  durationMinutes: number;
  questions: ExamSessionQuestion[];
}

export interface ExamSessionData {
  id: string;
  status: string;
  packageTitle: string;
  isAntiCheat: boolean;
  serverDeadline: string;
  violations: number;
  sections: ExamSessionSection[];
}

// ---------------------------------------------------------------------------
// Hook options
// ---------------------------------------------------------------------------

export interface UseExamSessionOptions {
  /** URL to redirect to after a successful submit (e.g. "/exam/:id/result") */
  resultPath: string;
  /** URL to redirect to when the exam fails to load (e.g. "/dashboard/tryout") */
  fallbackPath: string;
  /**
   * Called immediately before each network save request fires.
   * Platforms that need a save status indicator (desktop) can use this
   * to set their "saving" state.
   */
  onSaveStart?: () => void;
  /**
   * Called after each network save request completes (success or error).
   * Platforms that need a save status indicator (desktop) can use this
   * to set their "saved" / "idle" state.
   */
  onSaveEnd?: () => void;
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseExamSessionReturn {
  // Data & loading
  examData: ExamSessionData | null;
  loading: boolean;

  // Navigation state
  currentSectionIdx: number;
  currentQuestionIdx: number;
  currentSection: ExamSessionSection | undefined;
  currentQuestion: ExamSessionQuestion | undefined;

  // Timer
  timeLeft: number;
  formatTime: (seconds: number) => string;

  // Submission
  isSubmitting: boolean;
  showConfirmSubmit: boolean;
  setShowConfirmSubmit: (value: boolean) => void;

  // Computed counts
  allQuestions: ExamSessionQuestion[];
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
  progressPercent: number;

  // Anti-cheat
  violationCount: number;
  showWarning: boolean;
  warningMessage: string;
  dismissWarning: () => void;

  // Actions
  selectOption: (optionId: string) => void;
  toggleFlag: () => void;
  navigateToQuestion: (sectionIdx: number, questionIdx: number) => void;
  navigateRelative: (direction: "prev" | "next") => void;
  findFirstUnanswered: () => { sIdx: number; qIdx: number } | null;
  submitExam: () => Promise<void>;
  saveAnswer: (question: ExamSessionQuestion) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function isQuestionAnswered(q: ExamSessionQuestion): boolean {
  return (
    !!q.selectedOptionId ||
    q.selectedOptions.length > 0 ||
    q.numericAnswer !== null
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useExamSession(
  attemptId: string,
  options: UseExamSessionOptions
): UseExamSessionReturn {
  const { resultPath, fallbackPath, onSaveStart, onSaveEnd } = options;
  const router = useRouter();

  const [examData, setExamData] = useState<ExamSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Refs for values used inside interval/timer callbacks
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionTimeRef = useRef(0);
  // handleSubmitRef lets the timer call the latest version of submitExam without
  // re-creating the interval every time isSubmitting changes.
  const handleSubmitRef = useRef<() => Promise<void>>(async () => {});

  // ---------------------------------------------------------------------------
  // Fetch exam data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function fetchExam(): Promise<void> {
      try {
        const response = await fetch(`/api/exam/${attemptId}`);
        const result = await response.json() as {
          data: ExamSessionData;
          error?: { message?: string };
        };

        if (!response.ok) {
          toast.error(result.error?.message ?? "Gagal memuat ujian");
          router.push(fallbackPath);
          return;
        }

        if (result.data.status !== "IN_PROGRESS") {
          router.push(resultPath);
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
        router.push(fallbackPath);
      } finally {
        setLoading(false);
      }
    }

    fetchExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------

  // Depend on the truthiness of timeLeft and presence of examData so we don't
  // spin up a new interval on every second tick — same pattern as originals.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (timeLeft <= 0 || !examData) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
      questionTimeRef.current += 1;
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft > 0, examData]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const currentSection = examData?.sections[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQuestionIdx];

  const allQuestions =
    examData?.sections.flatMap((s) => s.questions) ?? [];
  const answeredCount = allQuestions.filter(isQuestionAnswered).length;
  const flaggedCount = allQuestions.filter((q) => q.isFlagged).length;
  const unansweredCount = allQuestions.length - answeredCount;
  const progressPercent =
    allQuestions.length > 0
      ? Math.round((answeredCount / allQuestions.length) * 100)
      : 0;

  // ---------------------------------------------------------------------------
  // Anti-cheat
  // ---------------------------------------------------------------------------

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
      void submitExam();
    },
  });

  // ---------------------------------------------------------------------------
  // Save answer
  // ---------------------------------------------------------------------------

  // Stable refs for the save callbacks so they don't recreate saveAnswer
  const onSaveStartRef = useRef(onSaveStart);
  const onSaveEndRef = useRef(onSaveEnd);
  onSaveStartRef.current = onSaveStart;
  onSaveEndRef.current = onSaveEnd;

  const saveAnswer = useCallback(
    async (question: ExamSessionQuestion): Promise<void> => {
      onSaveStartRef.current?.();
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
      } finally {
        onSaveEndRef.current?.();
      }
    },
    [attemptId]
  );

  function debouncedSave(question: ExamSessionQuestion): void {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => void saveAnswer(question), 500);
  }

  // ---------------------------------------------------------------------------
  // selectOption
  // ---------------------------------------------------------------------------

  function selectOption(optionId: string): void {
    if (!examData || !currentQuestion) return;

    const updated: ExamSessionData = {
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

  // ---------------------------------------------------------------------------
  // toggleFlag
  // ---------------------------------------------------------------------------

  function toggleFlag(): void {
    if (!examData || !currentQuestion) return;

    const updated: ExamSessionData = {
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

  // ---------------------------------------------------------------------------
  // navigateToQuestion — core navigation (saves time spent on current question)
  // ---------------------------------------------------------------------------

  function navigateToQuestion(sectionIdx: number, questionIdx: number): void {
    if (currentQuestion && examData) {
      const timeSpent = questionTimeRef.current;
      const updated: ExamSessionData = {
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
      void saveAnswer(
        updated.sections[currentSectionIdx].questions[currentQuestionIdx]
      );
    }

    questionTimeRef.current = 0;
    setCurrentSectionIdx(sectionIdx);
    setCurrentQuestionIdx(questionIdx);
  }

  // ---------------------------------------------------------------------------
  // navigateRelative — move prev/next across section boundaries
  // ---------------------------------------------------------------------------

  function navigateRelative(direction: "prev" | "next"): void {
    if (!examData || !currentSection) return;

    if (direction === "prev") {
      if (currentQuestionIdx > 0) {
        navigateToQuestion(currentSectionIdx, currentQuestionIdx - 1);
      } else if (currentSectionIdx > 0) {
        const prevSection = examData.sections[currentSectionIdx - 1];
        navigateToQuestion(
          currentSectionIdx - 1,
          prevSection.questions.length - 1
        );
      }
    } else {
      if (currentQuestionIdx < currentSection.questions.length - 1) {
        navigateToQuestion(currentSectionIdx, currentQuestionIdx + 1);
      } else if (currentSectionIdx < examData.sections.length - 1) {
        navigateToQuestion(currentSectionIdx + 1, 0);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // findFirstUnanswered
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // submitExam
  // ---------------------------------------------------------------------------

  async function submitExam(): Promise<void> {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (currentQuestion) {
      await saveAnswer(currentQuestion);
    }

    try {
      const response = await fetch(`/api/exam/${attemptId}/submit`, {
        method: "POST",
      });

      const result = await response.json() as {
        error?: { message?: string };
      };

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal mengirim jawaban");
        setIsSubmitting(false);
        return;
      }

      toast.success("Ujian berhasil diselesaikan!");
      router.push(resultPath);
    } catch {
      toast.error("Gagal mengirim jawaban");
      setIsSubmitting(false);
    }
  }

  // Keep handleSubmitRef up-to-date so the timer callback always calls the
  // latest version without needing the interval to be recreated.
  handleSubmitRef.current = submitExam;

  // ---------------------------------------------------------------------------
  // formatTime
  // ---------------------------------------------------------------------------

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    examData,
    loading,
    currentSectionIdx,
    currentQuestionIdx,
    currentSection,
    currentQuestion,
    timeLeft,
    formatTime,
    isSubmitting,
    showConfirmSubmit,
    setShowConfirmSubmit,
    allQuestions,
    answeredCount,
    flaggedCount,
    unansweredCount,
    progressPercent,
    violationCount,
    showWarning,
    warningMessage,
    dismissWarning,
    selectOption,
    toggleFlag,
    navigateToQuestion,
    navigateRelative,
    findFirstUnanswered,
    submitExam,
    saveAnswer,
  };
}
