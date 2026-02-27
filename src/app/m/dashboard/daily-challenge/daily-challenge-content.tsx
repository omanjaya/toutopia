"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Zap,
  Target,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { cn } from "@/shared/lib/utils";

interface ChallengeOption {
  id: string;
  label: string;
  content: string;
  imageUrl: string | null;
  isCorrect?: boolean;
}

interface ChallengeQuestion {
  id: string;
  content: string;
  type: string;
  imageUrl: string | null;
  topic: string;
  options: ChallengeOption[];
  explanation?: string;
}

interface ChallengeData {
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

export function MobileDailyChallengeContent() {
  const [data, setData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fetchChallenge = useCallback(async () => {
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

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background px-4 pb-24 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/m/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">
            Daily Challenge
          </h1>
        </div>
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Zap className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Belum ada challenge hari ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Daily Challenge
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date(data.date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {!isSubmitted && (
          <div className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-sm tabular-nums">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {formatTimer(timer)}
          </div>
        )}
      </div>

      {/* Streak Cards */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="flex flex-col items-center p-4">
            <Flame className="mb-1 h-6 w-6 text-orange-500" />
            <p className="text-3xl font-bold tabular-nums text-orange-600">
              {data.streak.current}
            </p>
            <p className="text-xs text-muted-foreground">Streak Saat Ini</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-sm dark:from-purple-950/20 dark:to-violet-950/20">
          <CardContent className="flex flex-col items-center p-4">
            <Trophy className="mb-1 h-6 w-6 text-purple-500" />
            <p className="text-3xl font-bold tabular-nums text-purple-600">
              {data.streak.longest}
            </p>
            <p className="text-xs text-muted-foreground">Streak Terpanjang</p>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit text-xs">
            <Target className="mr-1 h-3 w-3" />
            {data.question.topic}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question content */}
          <MathRenderer
            content={data.question.content}
            className="prose prose-sm max-w-none overflow-hidden break-words dark:prose-invert [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto"
          />
          {data.question.imageUrl && (
            <div className="relative w-full overflow-hidden rounded-lg bg-muted" style={{ maxHeight: "12rem" }}>
              <Image
                src={data.question.imageUrl}
                alt="Soal"
                width={400}
                height={192}
                className="h-auto max-h-48 w-full rounded-lg object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-2">
            {data.question.options.map((opt) => {
              const isSelected =
                selectedOption === opt.id ||
                data.userAttempt?.selectedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (!isSubmitted) setSelectedOption(opt.id);
                  }}
                  disabled={isSubmitted}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all min-h-[44px]",
                    !isSubmitted &&
                      isSelected &&
                      "border-primary bg-primary/5",
                    !isSubmitted &&
                      !isSelected &&
                      "border-transparent bg-muted/40 hover:bg-muted/60",
                    isSubmitted &&
                      opt.isCorrect &&
                      "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
                    isSubmitted &&
                      isSelected &&
                      !opt.isCorrect &&
                      "border-destructive bg-destructive/5",
                    isSubmitted &&
                      !opt.isCorrect &&
                      !isSelected &&
                      "border-transparent bg-muted/30 opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isSubmitted && opt.isCorrect
                        ? "bg-emerald-500 text-white"
                        : isSubmitted && isSelected && !opt.isCorrect
                          ? "bg-destructive text-white"
                          : isSelected
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground",
                    )}
                  >
                    {opt.label}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <MathRenderer content={opt.content} className="text-sm" />
                  </div>
                  {isSubmitted && opt.isCorrect && (
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />
                  )}
                  {isSubmitted && isSelected && !opt.isCorrect && (
                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit button */}
          {!isSubmitted && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption || submitting}
              className="w-full rounded-xl py-3 text-base font-semibold min-h-12"
              size="lg"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Submit Jawaban
            </Button>
          )}

          {/* Result */}
          {isSubmitted && data.userAttempt && (
            <div
              className={cn(
                "rounded-xl p-4 text-center",
                data.userAttempt.isCorrect
                  ? "bg-emerald-50 dark:bg-emerald-950/20"
                  : "bg-red-50 dark:bg-red-950/20",
              )}
            >
              {data.userAttempt.isCorrect ? (
                <>
                  <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    Benar!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Waktu: {formatTimer(data.userAttempt.timeSpentSeconds)}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto mb-2 h-10 w-10 text-destructive" />
                  <p className="text-lg font-bold text-destructive">Salah</p>
                  <p className="text-sm text-muted-foreground">
                    Jangan menyerah, coba lagi besok!
                  </p>
                </>
              )}
            </div>
          )}

          {/* Explanation after submit */}
          {isSubmitted && data.question.explanation && (
            <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pembahasan
              </p>
              <MathRenderer
                content={data.question.explanation}
                className="prose prose-sm max-w-none overflow-hidden break-words text-sm dark:prose-invert [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
