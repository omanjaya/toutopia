"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
    FileText,
    Download,
    Loader2,
    Trophy,
    TrendingUp,
    Clock,
    Target,
    Award,
    BarChart3,
    Flame,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ReportSummary {
    totalAttempts: number;
    totalQuestions: number;
    totalCorrect: number;
    avgScore: number;
    totalStudyTimeMinutes: number;
    passingRate: number;
    currentStreak: number;
    longestStreak: number;
}

interface CategoryBreakdown {
    category: string;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    attempts: number;
}

interface ScoreTrend {
    date: string;
    score: number;
    package: string;
}

interface RecentAttempt {
    packageTitle: string;
    category: string;
    score: number | null;
    totalCorrect: number | null;
    totalQuestions: number;
    finishedAt: string | null;
    passed: boolean | null;
}

interface BadgeItem {
    name: string;
    icon: string;
    category: string;
    earnedAt: string;
}

interface ReportData {
    user: { name: string; email: string };
    period: string;
    generatedAt: string;
    summary: ReportSummary;
    categoryBreakdown: CategoryBreakdown[];
    scoreTrend: ScoreTrend[];
    recentAttempts: RecentAttempt[];
    badges: BadgeItem[];
}

type PeriodType = "week" | "month" | "all";

export function ReportContent() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<PeriodType>("all");
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchReport(): Promise<void> {
            setLoading(true);
            try {
                const res = await fetch(`/api/reports?period=${period}`);
                const result = await res.json();
                if (result.success) {
                    setData(result.data as ReportData);
                }
            } catch {
                toast.error("Gagal memuat laporan");
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [period]);

    async function handleExportPdf(): Promise<void> {
        if (!reportRef.current) return;

        setExporting(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= 297;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= 297;
            }

            const filename = `Rapor-Belajar-${data?.user.name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename);

            toast.success("PDF berhasil di-download!");
        } catch {
            toast.error("Gagal export PDF");
        } finally {
            setExporting(false);
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
                <p className="text-muted-foreground">Gagal memuat rapor</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Rapor Belajar</h1>
                        <p className="text-sm text-muted-foreground">{data.user.name}</p>
                    </div>
                </div>
                <Button onClick={handleExportPdf} disabled={exporting} className="gap-2">
                    {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Export PDF
                </Button>
            </div>

            {/* Period Selector */}
            <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
                {([
                    { key: "week" as const, label: "7 Hari" },
                    { key: "month" as const, label: "30 Hari" },
                    { key: "all" as const, label: "Semua" },
                ]).map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setPeriod(key)}
                        className={cn(
                            "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                            period === key
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Report Content (for PDF export) */}
            <div ref={reportRef} className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Card className="border-0 bg-card shadow-sm">
                        <CardContent className="flex flex-col items-center p-4">
                            <Trophy className="mb-1 h-5 w-5 text-amber-500" />
                            <p className="text-2xl font-bold tabular-nums">{data.summary.avgScore}</p>
                            <p className="text-xs text-muted-foreground">Rata-rata Skor</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-card shadow-sm">
                        <CardContent className="flex flex-col items-center p-4">
                            <Target className="mb-1 h-5 w-5 text-emerald-500" />
                            <p className="text-2xl font-bold tabular-nums">{data.summary.passingRate}%</p>
                            <p className="text-xs text-muted-foreground">Tingkat Lulus</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-card shadow-sm">
                        <CardContent className="flex flex-col items-center p-4">
                            <Clock className="mb-1 h-5 w-5 text-blue-500" />
                            <p className="text-2xl font-bold tabular-nums">{data.summary.totalStudyTimeMinutes}m</p>
                            <p className="text-xs text-muted-foreground">Waktu Belajar</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-card shadow-sm">
                        <CardContent className="flex flex-col items-center p-4">
                            <Flame className="mb-1 h-5 w-5 text-orange-500" />
                            <p className="text-2xl font-bold tabular-nums">{data.summary.currentStreak}</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Accuracy Summary */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Soal Dikerjakan</p>
                                <p className="text-4xl font-bold">{data.summary.totalQuestions}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Akurasi</p>
                                <p className="text-4xl font-bold text-emerald-600">
                                    {data.summary.totalQuestions > 0
                                        ? Math.round((data.summary.totalCorrect / data.summary.totalQuestions) * 100)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                                style={{
                                    width: `${data.summary.totalQuestions > 0 ? (data.summary.totalCorrect / data.summary.totalQuestions) * 100 : 0}%`
                                }}
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>{data.summary.totalCorrect} benar</span>
                            <span>{data.summary.totalQuestions - data.summary.totalCorrect} salah</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                {data.categoryBreakdown.length > 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Breakdown per Kategori
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.categoryBreakdown.map((cat) => (
                                <div key={cat.category} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{cat.category}</span>
                                        <span className="text-sm font-bold tabular-nums">{cat.accuracy}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                cat.accuracy >= 70 ? "bg-emerald-500" :
                                                    cat.accuracy >= 40 ? "bg-amber-500" : "bg-destructive"
                                            )}
                                            style={{ width: `${cat.accuracy}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {cat.correctAnswers}/{cat.totalQuestions} benar · {cat.attempts} percobaan
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Recent Attempts */}
                {data.recentAttempts.length > 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Riwayat Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.recentAttempts.map((attempt, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="text-sm font-medium">{attempt.packageTitle}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {attempt.category} · {attempt.finishedAt
                                                ? new Date(attempt.finishedAt).toLocaleDateString("id-ID")
                                                : "-"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold tabular-nums">
                                            {attempt.totalCorrect}/{attempt.totalQuestions}
                                        </span>
                                        {attempt.passed !== null && (
                                            <Badge variant={attempt.passed ? "default" : "destructive"} className="text-xs">
                                                {attempt.passed ? "Lulus" : "Tidak Lulus"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Badges */}
                {data.badges.length > 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Award className="h-5 w-5 text-amber-500" />
                                Badge yang Diperoleh
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {data.badges.map((badge, idx) => (
                                    <Badge key={idx} variant="outline" className="gap-1 px-3 py-1.5">
                                        <span className="text-base">{badge.icon}</span>
                                        {badge.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    Digenerate pada {new Date(data.generatedAt).toLocaleString("id-ID")} · Toutopia
                </p>
            </div>
        </div>
    );
}
