"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Brain,
  TrendingDown,
  TrendingUp,
  Target,
  Loader2,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface TopicStat {
  topicId: string;
  topicName: string;
  subjectName: string;
  categoryName: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface RecommendedQuestion {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  topic: string;
  subject: string;
}

interface RecommendationData {
  weakTopics: TopicStat[];
  strongTopics: TopicStat[];
  recommendedQuestions: RecommendedQuestion[];
  totalAnswered: number;
  totalTopicsAnalyzed: number;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "VERY_EASY":
      return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20";
    case "EASY":
      return "text-green-600 bg-green-50 dark:bg-green-950/20";
    case "MEDIUM":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/20";
    case "HARD":
      return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
    case "VERY_HARD":
      return "text-red-600 bg-red-50 dark:bg-red-950/20";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export function MobileRecommendationsContent() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations(): Promise<void> {
      try {
        const res = await fetch("/api/recommendations");
        const result = await res.json();
        if (result.success) {
          setData(result.data as RecommendationData);
        }
      } catch {
        toast.error("Gagal memuat rekomendasi");
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

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
            Rekomendasi Belajar
          </h1>
        </div>
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted-foreground">Gagal memuat data</p>
        </div>
      </div>
    );
  }

  const hasEnoughData = data.totalAnswered >= 10;

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
            Rekomendasi Belajar
          </h1>
          <p className="text-xs text-muted-foreground">
            Analisis dari {data.totalAnswered} jawaban di{" "}
            {data.totalTopicsAnalyzed} topik
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Data warning */}
        {!hasEnoughData && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Data belum cukup
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                  Kerjakan minimal 10 soal untuk mendapatkan rekomendasi yang
                  akurat. Saat ini baru {data.totalAnswered} soal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Weak Topics */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
              <TrendingDown className="h-5 w-5" />
              Topik yang Perlu Ditingkatkan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.weakTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum cukup data untuk analisis
              </p>
            ) : (
              data.weakTopics.map((topic) => (
                <div
                  key={topic.topicId}
                  className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-3"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-medium truncate">
                      {topic.topicName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {topic.subjectName} · {topic.categoryName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        topic.accuracy < 40
                          ? "text-destructive"
                          : "text-amber-600",
                      )}
                    >
                      {topic.accuracy}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.correct}/{topic.total} benar
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Strong Topics */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-emerald-600">
              <TrendingUp className="h-5 w-5" />
              Topik Terkuatmu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.strongTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum cukup data
              </p>
            ) : (
              data.strongTopics.map((topic) => (
                <div
                  key={topic.topicId}
                  className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/10"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-medium truncate">
                      {topic.topicName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {topic.subjectName} · {topic.categoryName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold tabular-nums text-emerald-600">
                      {topic.accuracy}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.correct}/{topic.total} benar
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recommended Questions */}
        {data.recommendedQuestions.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Target className="h-5 w-5 text-primary" />
                Soal yang Direkomendasikan
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Berdasarkan topik yang masih lemah
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.recommendedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start gap-3 rounded-xl border p-3.5"
                >
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm line-clamp-2">{q.content}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        {q.topic}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {q.subject}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs",
                          getDifficultyColor(q.difficulty),
                        )}
                      >
                        {q.difficulty.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
