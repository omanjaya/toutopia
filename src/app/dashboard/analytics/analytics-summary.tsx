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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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

export default function AnalyticsSummary() {
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

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Ujian
            </p>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-2">
            <p className="text-2xl font-bold">{data.summary.totalAttempts}</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Rata-rata Skor
            </p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-2">
            <p className="text-2xl font-bold">{data.summary.avgScore}</p>
            <p className="text-xs text-muted-foreground">dari 1000</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Skor Tertinggi
            </p>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="p-6 pt-2">
            <p className="text-2xl font-bold">{data.summary.bestScore}</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Akurasi
            </p>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="p-6 pt-2">
            <p className="text-2xl font-bold">{data.summary.accuracy}%</p>
            <p className="text-xs text-muted-foreground">
              {data.summary.totalCorrect} benar / {data.summary.totalIncorrect} salah
            </p>
          </div>
        </div>
      </div>

      {/* Score Trend */}
      {data.scoreTrend.length > 1 && (
        <div className={cardCls}>
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-lg font-semibold tracking-tight">Tren Skor</h3>
          </div>
          <div className="p-6 pt-2">
            <div className="h-72">
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
                    className="text-xs"
                  />
                  <YAxis domain={[0, 1000]} className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as { packageTitle: string; score: number; date: string };
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <p className="text-sm font-medium">{d.packageTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Skor: {d.score}/1000
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(d.date).toLocaleDateString("id-ID", {
                              dateStyle: "medium",
                            })}
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
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Radar */}
        {data.categoryPerformance.length > 2 && (
          <div className={cardCls}>
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-semibold tracking-tight">Performa per Kategori</h3>
            </div>
            <div className="p-6 pt-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.categoryPerformance}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis
                      dataKey="category"
                      className="text-xs"
                      tick={{ fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 1000]}
                      tick={{ fontSize: 10 }}
                    />
                    <Radar
                      dataKey="avgScore"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Category Bar (fallback if less than 3 categories) */}
        {data.categoryPerformance.length > 0 &&
          data.categoryPerformance.length <= 2 && (
            <div className={cardCls}>
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-lg font-semibold tracking-tight">Performa per Kategori</h3>
              </div>
              <div className="p-6 pt-2">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.categoryPerformance}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="category" className="text-xs" />
                      <YAxis domain={[0, 1000]} className="text-xs" />
                      <Tooltip />
                      <Bar
                        dataKey="avgScore"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        {/* Weakest Topics */}
        {data.weakestTopics.length > 0 && (
          <div className={cardCls}>
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Topik Terlemah
              </h3>
            </div>
            <div className="p-6 pt-2">
              <div className="space-y-3">
                {data.weakestTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{topic.topicName}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.subjectName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                      <span className="font-medium text-destructive">
                        {topic.errorCount} salah
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {data.scoreTrend.length === 0 && (
        <div className={cardCls}>
          <div className="p-6 py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-medium">Belum ada data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selesaikan minimal 1 ujian untuk melihat analitik
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
