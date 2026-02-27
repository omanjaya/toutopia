"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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

export function DailyChallengeContent() {
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

    // Timer
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
                // Refetch to get updated data with correct answers
                await fetchChallenge();

                if (result.data.isCorrect) {
                    toast.success("🎉 Jawaban benar! Streak bertambah!");
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

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-muted-foreground">Belum ada challenge hari ini</p>
            </div>
        );
    }

    const formatTimer = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/25">
                        <Zap className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Daily Challenge</h1>
                <p className="text-sm text-muted-foreground">
                    {new Date(data.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            </div>

            {/* Streak Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm dark:from-orange-950/20 dark:to-amber-950/20">
                    <CardContent className="flex flex-col items-center p-4">
                        <Flame className="mb-1 h-6 w-6 text-orange-500" />
                        <p className="text-3xl font-bold tabular-nums text-orange-600">{data.streak.current}</p>
                        <p className="text-xs text-muted-foreground">Streak Saat Ini</p>
                    </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-sm dark:from-purple-950/20 dark:to-violet-950/20">
                    <CardContent className="flex flex-col items-center p-4">
                        <Trophy className="mb-1 h-6 w-6 text-purple-500" />
                        <p className="text-3xl font-bold tabular-nums text-purple-600">{data.streak.longest}</p>
                        <p className="text-xs text-muted-foreground">Streak Terpanjang</p>
                    </CardContent>
                </Card>
            </div>

            {/* Question Card */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                            <Target className="mr-1 h-3 w-3" />
                            {data.question.topic}
                        </Badge>
                        {!isSubmitted && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
                                <Clock className="h-4 w-4" />
                                {formatTimer(timer)}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Question content */}
                    <MathRenderer
                        content={data.question.content}
                        className="prose prose-sm max-w-none dark:prose-invert"
                    />
                    {data.question.imageUrl && (
                        <img src={data.question.imageUrl} alt="Soal" className="max-h-48 rounded-lg" />
                    )}

                    {/* Options */}
                    <div className="space-y-2">
                        {data.question.options.map((opt) => {
                            const isSelected = selectedOption === opt.id ||
                                data.userAttempt?.selectedOptionId === opt.id;

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        if (!isSubmitted) setSelectedOption(opt.id);
                                    }}
                                    disabled={isSubmitted}
                                    className={cn(
                                        "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-all",
                                        !isSubmitted && isSelected && "border-primary bg-primary/5",
                                        !isSubmitted && !isSelected && "border-transparent bg-muted/40 hover:bg-muted/60",
                                        isSubmitted && opt.isCorrect && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
                                        isSubmitted && isSelected && !opt.isCorrect && "border-destructive bg-destructive/5",
                                        isSubmitted && !opt.isCorrect && !isSelected && "border-transparent bg-muted/30 opacity-60"
                                    )}
                                >
                                    <span className={cn(
                                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                        isSubmitted && opt.isCorrect ? "bg-emerald-500 text-white" :
                                            isSubmitted && isSelected && !opt.isCorrect ? "bg-destructive text-white" :
                                                isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        {opt.label}
                                    </span>
                                    <div className="flex-1 pt-0.5">
                                        <MathRenderer content={opt.content} className="text-sm" />
                                    </div>
                                    {isSubmitted && opt.isCorrect && <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />}
                                    {isSubmitted && isSelected && !opt.isCorrect && <XCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Submit button */}
                    {!isSubmitted && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedOption || submitting}
                            className="w-full rounded-xl py-3 text-base font-semibold"
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
                        <div className={cn(
                            "rounded-xl p-4 text-center",
                            data.userAttempt.isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/20"
                                : "bg-red-50 dark:bg-red-950/20"
                        )}>
                            {data.userAttempt.isCorrect ? (
                                <>
                                    <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
                                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Benar! 🎉</p>
                                    <p className="text-sm text-muted-foreground">
                                        Waktu: {formatTimer(data.userAttempt.timeSpentSeconds)}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <XCircle className="mx-auto mb-2 h-10 w-10 text-destructive" />
                                    <p className="text-lg font-bold text-destructive">Salah 😔</p>
                                    <p className="text-sm text-muted-foreground">Jangan menyerah, coba lagi besok!</p>
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
                                className="prose prose-sm max-w-none text-sm dark:prose-invert"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
