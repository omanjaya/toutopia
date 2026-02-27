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

export default function ProgressTab() {
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
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium">Belum ada data</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Selesaikan minimal 1 ujian untuk melihat progres
          </p>
        </CardContent>
      </Card>
    );
  }

  const achievedMilestones = data.milestones.filter((m) => m.achieved);
  const unachievedMilestones = data.milestones.filter((m) => !m.achieved);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ujian
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalAttempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Skor Tertinggi
            </CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.bestScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pencapaian
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{achievedMilestones.length}</p>
            <p className="text-xs text-muted-foreground">
              dari {data.milestones.length} milestone
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      {data.weeklyProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progres Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyProgress}>
                  <defs>
                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                    className="text-xs"
                  />
                  <YAxis domain={[0, 1000]} className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as WeeklyProgress;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <p className="text-sm font-medium">
                            Minggu {new Date(d.week).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Rata-rata: {d.avgScore}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tertinggi: {d.maxScore}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                    fill="url(#colorMax)"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-primary" />
                <span>Rata-rata Skor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 border-t-2 border-dashed border-primary" />
                <span>Skor Tertinggi</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {data.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Pencapaian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievedMilestones.map((milestone) => {
                const Icon = getMilestoneIcon(milestone.type);
                return (
                  <div
                    key={milestone.type}
                    className="flex items-center gap-3 rounded-lg border bg-emerald-50 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">{milestone.label}</p>
                      <p className="text-xs text-emerald-600">Tercapai</p>
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{milestone.label}</p>
                      <p className="text-xs text-muted-foreground">Belum tercapai</p>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ringkasan per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getMonthlyFromWeekly(data.weeklyProgress).map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{month.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {month.attempts} ujian
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{month.avgScore}</p>
                    <p className="text-xs text-muted-foreground">rata-rata skor</p>
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
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      attempts: data.attempts,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
}
