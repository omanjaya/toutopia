"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  TrendingUp,
  Trophy,
  Award,
  Star,
  Target,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";
import { cn } from "@/shared/lib/utils";

interface WeeklyProgress {
  week: string;
  avgScore: number;
  maxScore: number;
  attempts: number;
  categories: string[];
}

interface Milestone {
  type: string;
  label: string;
  achieved: boolean;
}

interface ProgressData {
  weeklyProgress: WeeklyProgress[];
  milestones: Milestone[];
  totalAttempts: number;
  bestScore: number;
}

function getMilestoneIcon(type: string): typeof Trophy {
  if (type.startsWith("score_")) return Star;
  if (type === "first_exam") return Award;
  return Trophy;
}

export default function MobileProgressTab() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const res = await fetch("/api/user/analytics/progress");
        const result = await res.json();
        if (res.ok) setData(result.data);
      } catch {
        toast.error("Gagal memuat data progres");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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

  if (data.totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-base font-semibold">Belum ada data</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selesaikan minimal 1 ujian untuk melihat progres
        </p>
      </div>
    );
  }

  const achievedMilestones = data.milestones.filter((m) => m.achieved);
  const unachievedMilestones = data.milestones.filter((m) => !m.achieved);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{data.totalAttempts}</p>
            <p className="text-[10px] text-muted-foreground">Total Ujian</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold">{data.bestScore}</p>
            <p className="text-[10px] text-muted-foreground">Tertinggi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="mx-auto h-4 w-4 text-amber-500" />
            <p className="mt-1 text-xl font-bold">{achievedMilestones.length}</p>
            <p className="text-[10px] text-muted-foreground">
              /{data.milestones.length} milestone
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      {data.weeklyProgress.length > 0 && (
        <Card>
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Progres Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyProgress}>
                  <defs>
                    <linearGradient id="mColorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="week"
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
                      const d = payload[0].payload as WeeklyProgress;
                      return (
                        <div className="max-w-[200px] rounded-lg border bg-background p-2.5 shadow-sm text-xs">
                          <p className="font-medium">
                            Minggu{" "}
                            {new Date(d.week).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                          <p className="text-muted-foreground">
                            Rata-rata: {d.avgScore}
                          </p>
                          <p className="text-muted-foreground">
                            Tertinggi: {d.maxScore}
                          </p>
                          <p className="text-muted-foreground">
                            {d.attempts} ujian
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="maxScore"
                    stroke="hsl(var(--primary))"
                    strokeWidth={1}
                    fill="url(#mColorMax)"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-3 bg-primary" />
                <span>Rata-rata</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-3 border-t-2 border-dashed border-primary" />
                <span>Tertinggi</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {data.milestones.length > 0 && (
        <Card>
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-amber-500" />
              Pencapaian
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2.5">
              {achievedMilestones.map((milestone) => {
                const Icon = getMilestoneIcon(milestone.type);
                return (
                  <div
                    key={milestone.type}
                    className="flex items-center gap-3 rounded-lg border bg-emerald-50 p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-emerald-900">
                        {milestone.label}
                      </p>
                      <p className="text-[11px] text-emerald-600">Tercapai</p>
                    </div>
                  </div>
                );
              })}
              {unachievedMilestones.map((milestone) => {
                const Icon = getMilestoneIcon(milestone.type);
                return (
                  <div
                    key={milestone.type}
                    className="flex items-center gap-3 rounded-lg border border-dashed p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-muted-foreground">
                        {milestone.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Belum tercapai
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */}
      {data.weeklyProgress.length > 0 && (
        <Card>
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Ringkasan per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {getMonthlyFromWeekly(data.weeklyProgress).map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold">{month.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {month.attempts} ujian
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{month.avgScore}</p>
                    <p className="text-[10px] text-muted-foreground">
                      rata-rata skor
                    </p>
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

interface MonthlySummary {
  month: string;
  label: string;
  avgScore: number;
  attempts: number;
}

function getMonthlyFromWeekly(weekly: WeeklyProgress[]): MonthlySummary[] {
  const monthMap = new Map<string, { scores: number[]; attempts: number }>();

  for (const w of weekly) {
    const date = new Date(w.week);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { scores: [], attempts: 0 });
    }
    const m = monthMap.get(monthKey)!;
    m.scores.push(w.avgScore);
    m.attempts += w.attempts;
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
      avgScore: Math.round(
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      ),
      attempts: data.attempts,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
}
