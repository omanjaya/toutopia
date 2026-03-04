"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface ChallengeOption {
  id: string;
  label: string;
  content: string;
  imageUrl: string | null;
  isCorrect?: boolean;
}

export interface ChallengeQuestion {
  id: string;
  content: string;
  type: string;
  imageUrl: string | null;
  topic: string;
  options: ChallengeOption[];
  explanation?: string;
}

export interface ChallengeData {
  id: string;
  date: string;
  question: ChallengeQuestion;
  isAttempted: boolean;
  userAttempt: {
    isCorrect: boolean;
    selectedOptionId: string | null;
    numericAnswer: number | null;
    timeSpentSeconds: number;
  } | null;
  streak: {
    current: number;
    longest: number;
  };
}

export interface UseDailyChallengeReturn {
  data: ChallengeData | null;
  loading: boolean;
  selectedOption: string | null;
  submitting: boolean;
  timer: number;
  isSubmitted: boolean;
  setSelectedOption: (id: string | null) => void;
  handleSubmit: () => Promise<void>;
  formatTimer: (seconds: number) => string;
}

/**
 * Encapsulates all state, timer, and API interactions for the daily challenge.
 * Shared between desktop (DailyChallengeContent) and mobile (MobileDailyChallengeContent).
 */
export function useDailyChallenge(): UseDailyChallengeReturn {
  const [data, setData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fetchChallenge = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/daily-challenge");
      const result = await res.json();
      if (result.success) {
        setData(result.data as ChallengeData);
        if (result.data.isAttempted) {
          setIsSubmitted(true);
        }
      }
    } catch {
      toast.error("Gagal memuat daily challenge");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  useEffect(() => {
    if (data && !data.isAttempted && !isSubmitted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [data, isSubmitted]);

  async function handleSubmit(): Promise<void> {
    if (!selectedOption || !data) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/daily-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptionId: selectedOption,
          timeSpentSeconds: timer,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setIsSubmitted(true);
        await fetchChallenge();

        if (result.data.isCorrect) {
          toast.success("Jawaban benar! Streak bertambah!");
        } else {
          toast.error("Jawaban salah. Coba lagi besok!");
        }
      } else {
        toast.error(result.error?.message ?? "Gagal submit jawaban");
      }
    } catch {
      toast.error("Gagal submit jawaban");
    } finally {
      setSubmitting(false);
    }
  }

  function formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return {
    data,
    loading,
    selectedOption,
    submitting,
    timer,
    isSubmitted,
    setSelectedOption,
    handleSubmit,
    formatTimer,
  };
}
