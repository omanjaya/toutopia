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
    Calendar,
    TrendingUp,
    ArrowRight,
    Sparkles,
    Timer,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { cn } from "@/shared/lib/utils";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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

function CountdownToNextChallenge() {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        function update(): void {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(
                `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
            );
        }
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn(cardCls, "overflow-hidden")}>
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-5 text-center sm:p-6">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 sm:mb-3 sm:h-12 sm:w-12">
                    <Timer className="h-5 w-5 text-indigo-600 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">Challenge berikutnya dalam</p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums tracking-wider text-indigo-600 sm:text-3xl">
                    {timeLeft}
                </p>
            </div>
        </div>
    );
}

function StreakMilestone({ streak }: { streak: number }): React.ReactElement | null {
    const milestones = [
        { min: 30, label: "Legenda", color: "text-amber-500" },
        { min: 14, label: "Konsisten", color: "text-purple-500" },
        { min: 7, label: "Semangat!", color: "text-blue-500" },
        { min: 3, label: "Mulai Bagus", color: "text-emerald-500" },
    ];
    const milestone = milestones.find((m) => streak >= m.min);
    if (!milestone) return null;

    return (
        <div className="flex items-center gap-1.5">
            <Sparkles className={cn("h-3.5 w-3.5", milestone.color)} />
            <span className={cn("text-xs font-semibold", milestone.color)}>{milestone.label}</span>
        </div>
    );
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
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Memuat challenge...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-20 sm:w-20">
                    <Calendar className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                </div>
                <h2 className="text-lg font-bold sm:text-xl">Belum Ada Challenge</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Challenge hari ini belum tersedia. Tambahkan soal terlebih dahulu agar daily challenge dapat dibuat otomatis.
                </p>
            </div>
        );
    }

    const dateStr = new Date(data.date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="mx-auto max-w-2xl space-y-4 px-4 pb-24 pt-6 sm:space-y-5 sm:pb-8 sm:pt-8">
            {/* Header — mobile: inline with timer; desktop: centered */}
            <div className="flex items-center gap-3 sm:hidden">
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">Daily Challenge</h1>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                </div>
                {!isSubmitted && (
                    <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-sm tabular-nums">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatTimer(timer)}
                    </div>
                )}
            </div>
            <div className="hidden text-center sm:block">
                <div className="flex justify-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/25">
                        <Zap className="h-8 w-8 text-white" />
                        {!isSubmitted && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                                <span className="relative inline-flex h-5 w-5 rounded-full bg-orange-500" />
                            </span>
                        )}
                    </div>
                </div>
                <div className="mt-3">
                    <h1 className="text-2xl font-bold tracking-tight">Daily Challenge</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">{dateStr}</p>
                </div>
            </div>

            {/* Streak Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className={cn(cardCls, "overflow-hidden border-0")}>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3.5 sm:p-4">
                        <div className="flex items-center justify-between">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <StreakMilestone streak={data.streak.current} />
                        </div>
                        <p className="mt-1.5 text-2xl font-bold tabular-nums text-orange-600 sm:mt-2 sm:text-3xl">
                            {data.streak.current}
                            <span className="ml-1 text-xs font-medium text-orange-400 sm:text-sm">hari</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground sm:text-xs">Streak Saat Ini</p>
                    </div>
                </div>
                <div className={cn(cardCls, "overflow-hidden border-0")}>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-3.5 sm:p-4">
                        <div className="flex items-center justify-between">
                            <Trophy className="h-5 w-5 text-purple-500" />
                            {data.streak.longest > 0 && (
                                <TrendingUp className="h-4 w-4 text-purple-400" />
                            )}
                        </div>
                        <p className="mt-1.5 text-2xl font-bold tabular-nums text-purple-600 sm:mt-2 sm:text-3xl">
                            {data.streak.longest}
                            <span className="ml-1 text-xs font-medium text-purple-400 sm:text-sm">hari</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground sm:text-xs">Streak Terpanjang</p>
                    </div>
                </div>
            </div>

            {/* Already completed — result summary */}
            {isSubmitted && data.userAttempt && (
                <div className={cn(
                    cardCls,
                    "overflow-hidden border-0",
                    data.userAttempt.isCorrect
                        ? "ring-emerald-200"
                        : "ring-red-200"
                )}>
                    <div className={cn(
                        "flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5",
                        data.userAttempt.isCorrect
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50"
                            : "bg-gradient-to-r from-red-50 to-orange-50"
                    )}>
                        <div className={cn(
                            "flex shrink-0 items-center justify-center rounded-full",
                            "h-11 w-11 sm:h-14 sm:w-14",
                            data.userAttempt.isCorrect ? "bg-emerald-100" : "bg-red-100"
                        )}>
                            {data.userAttempt.isCorrect ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-500 sm:h-7 sm:w-7" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={cn(
                                "font-bold sm:text-lg",
                                data.userAttempt.isCorrect ? "text-emerald-700" : "text-red-600"
                            )}>
                                {data.userAttempt.isCorrect ? "Jawaban Benar!" : "Jawaban Salah"}
                            </p>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                {data.userAttempt.isCorrect
                                    ? "Streak kamu bertambah! Lanjutkan besok."
                                    : "Jangan menyerah, coba lagi besok!"}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="text-xs font-medium tabular-nums sm:text-sm">
                                {formatTimer(data.userAttempt.timeSpentSeconds)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Card */}
            <div className={cardCls}>
                <div className="px-5 pt-5 pb-2">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="gap-1 text-xs font-medium">
                            <Target className="h-3 w-3" />
                            {data.question.topic}
                        </Badge>
                        {/* Timer — desktop only (mobile shows it in header) */}
                        {!isSubmitted && (
                            <div className="hidden items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-sm tabular-nums text-muted-foreground sm:flex">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTimer(timer)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-4 p-5 pt-3">
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
                    <div className="space-y-2.5">
                        {data.question.options.map((opt) => {
                            const isSelected = selectedOption === opt.id ||
                                data.userAttempt?.selectedOptionId === opt.id;
                            const isCorrectAnswer = isSubmitted && opt.isCorrect;
                            const isWrongSelected = isSubmitted && isSelected && !opt.isCorrect;

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        if (!isSubmitted) setSelectedOption(opt.id);
                                    }}
                                    disabled={isSubmitted}
                                    className={cn(
                                        "flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-200 min-h-[44px]",
                                        !isSubmitted && !isSelected && "border-transparent bg-muted/40 hover:bg-muted/70 hover:border-muted",
                                        !isSubmitted && isSelected && "border-primary bg-primary/5 shadow-sm shadow-primary/10",
                                        isCorrectAnswer && "border-emerald-500 bg-emerald-50/80",
                                        isWrongSelected && "border-red-400 bg-red-50/80",
                                        isSubmitted && !opt.isCorrect && !isSelected && "border-transparent bg-muted/20 opacity-50"
                                    )}
                                >
                                    <span className={cn(
                                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                        isCorrectAnswer && "bg-emerald-500 text-white",
                                        isWrongSelected && "bg-red-500 text-white",
                                        !isSubmitted && isSelected && "bg-primary text-white",
                                        !isSubmitted && !isSelected && "bg-muted text-muted-foreground",
                                        isSubmitted && !opt.isCorrect && !isSelected && "bg-muted/60 text-muted-foreground"
                                    )}>
                                        {opt.label}
                                    </span>
                                    <div className="flex-1 pt-0.5">
                                        <MathRenderer
                                            content={opt.content}
                                            className="text-sm overflow-hidden break-words [&_img]:max-w-full"
                                        />
                                    </div>
                                    {isCorrectAnswer && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />}
                                    {isWrongSelected && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Submit button */}
                    {!isSubmitted && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedOption || submitting}
                            className="w-full gap-2 rounded-xl py-3 text-base font-semibold min-h-12"
                            size="lg"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ArrowRight className="h-4 w-4" />
                            )}
                            Submit Jawaban
                        </Button>
                    )}

                    {/* Explanation after submit */}
                    {isSubmitted && data.question.explanation && (
                        <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-4 sm:p-5">
                            <div className="mb-2 flex items-center gap-2 sm:mb-2.5">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                    Pembahasan
                                </p>
                            </div>
                            <MathRenderer
                                content={data.question.explanation}
                                className="prose prose-sm max-w-none overflow-hidden break-words text-sm dark:prose-invert [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Countdown to next challenge */}
            {isSubmitted && <CountdownToNextChallenge />}
        </div>
    );
}
