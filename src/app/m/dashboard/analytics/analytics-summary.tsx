"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/shared/lib/utils";

interface AnalyticsData {
  summary: {
    totalAttempts: number;
    avgScore: number;
    bestScore: number;
    totalCorrect: number;
    totalIncorrect: number;
    accuracy: number;
  };
  scoreTrend: {
    date: string;
    score: number;
    packageTitle: string;
  }[];
  categoryPerformance: {
    category: string;
    avgScore: number;
    attempts: number;
  }[];
  weakestTopics: {
    topicName: string;
    subjectName: string;
    errorCount: number;
  }[];
}

export default function MobileAnalyticsSummary() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics(): Promise<void> {
      try {
        const res = await fetch("/api/user/analytics");
        const result = await res.json();
        if (res.ok) setData(result.data);
      } catch {
        toast.error("Gagal memuat data analitik");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Gagal memuat data</p>
      </div>
    );
  }

  if (data.scoreTrend.length === 0 && data.summary.totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-base font-semibold">Belum ada data</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selesaikan minimal 1 ujian untuk melihat analitik
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">Total Ujian</p>
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="mt-1 text-2xl font-bold">{data.summary.totalAttempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">Rata-rata</p>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="mt-1 text-2xl font-bold">{data.summary.avgScore}</p>
            <p className="text-[10px] text-muted-foreground">dari 1000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">Tertinggi</p>
              <Target className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="mt-1 text-2xl font-bold">{data.summary.bestScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">Akurasi</p>
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold">{data.summary.accuracy}%</p>
            <p className="text-[10px] text-muted-foreground">
              {data.summary.totalCorrect} benar / {data.summary.totalIncorrect} salah
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend */}
      {data.scoreTrend.length > 1 && (
        <Card>
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-sm">Tren Skor</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                    className="text-[10px]"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 1000]}
                    className="text-[10px]"
                    tick={{ fontSize: 10 }}
                    width={35}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as {
                        packageTitle: string;
                        score: number;
                        date: string;
                      };
                      return (
                        <div className="max-w-[200px] rounded-lg border bg-background p-2.5 shadow-sm text-xs">
                          <p className="font-medium truncate">{d.packageTitle}</p>
                          <p className="text-muted-foreground">
                            Skor: {d.score}/1000
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Performance */}
      {data.categoryPerformance.length > 0 && (
        <Card>
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-sm">Performa per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="category"
                    className="text-[10px]"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    domain={[0, 1000]}
                    className="text-[10px]"
                    tick={{ fontSize: 10 }}
                    width={35}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="avgScore"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weakest Topics */}
      {data.weakestTopics.length > 0 && (
        <Card>
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Topik Terlemah
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2.5">
              {data.weakestTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{topic.topicName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {topic.subjectName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-sm">
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                    <span className="font-medium text-destructive">
                      {topic.errorCount} salah
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
