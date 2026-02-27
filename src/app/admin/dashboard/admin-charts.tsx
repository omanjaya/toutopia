"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, ArrowUpRight, Wallet, Users, Package, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/lib/utils";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface OverviewData {
  revenue: {
    total: number;
    paidTransactions: number;
    chart: { month: string; amount: number }[];
  };
  userGrowth: { month: string; count: number }[];
  popularPackages: { id: string; title: string; attempts: number }[];
  latestTransactions: {
    id: string;
    amount: number;
    paidAt: string | null;
    userName: string;
  }[];
}

function formatMonth(m: string): string {
  const [year, month] = m.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
}

function formatDate(d: string): string {
  return d.slice(5).replace("-", "/");
}

interface DailyRevenue {
  daily: { date: string; amount: number; count: number }[];
  byMethod: { method: string; amount: number }[];
  totalRevenue: number;
  totalTransactions: number;
}

interface DailyUsers {
  totalUsers: number;
  newUsersInPeriod: number;
  activeUsersInPeriod: number;
  dailyRegistrations: { date: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
}

const periodOptions = [
  { label: "7 hari", value: 7 },
  { label: "30 hari", value: 30 },
  { label: "90 hari", value: 90 },
];

const roleBadgeColor: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20",
  ADMIN: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20",
  TEACHER: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20",
  STUDENT: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-500/20",
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
  formatter: (value: number) => string;
  labelFormatter?: (label: string) => string;
  valueName?: string;
}

function ChartTooltipContent({ active, payload, label, formatter, labelFormatter, valueName }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">
        {labelFormatter ? labelFormatter(String(label)) : label}
      </p>
      <p className="text-sm font-semibold">
        {formatter(payload[0].value)}
        {valueName && <span className="ml-1 font-normal text-muted-foreground">{valueName}</span>}
      </p>
    </div>
  );
}

export function AdminCharts() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [revenueDetail, setRevenueDetail] = useState<DailyRevenue | null>(null);
  const [usersDetail, setUsersDetail] = useState<DailyUsers | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/analytics/overview");
        const result = await res.json();
        if (res.ok) setData(result.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchDetails() {
      setDetailLoading(true);
      try {
        const [revRes, usrRes] = await Promise.all([
          fetch(`/api/admin/analytics/revenue?days=${period}`),
          fetch(`/api/admin/analytics/users?days=${period}`),
        ]);
        const [revData, usrData] = await Promise.all([revRes.json(), usrRes.json()]);
        if (revData.success) setRevenueDetail(revData.data);
        if (usrData.success) setUsersDetail(usrData.data);
      } catch {
        // silent
      } finally {
        setDetailLoading(false);
      }
    }
    fetchDetails();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Memuat analitik...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxAttempts = Math.max(...data.popularPackages.map((p) => p.attempts), 1);

  return (
    <div className="space-y-8">
      {/* Overview Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Pendapatan Bulanan</CardTitle>
                <CardDescription>6 bulan terakhir</CardDescription>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.revenue.chart.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenue.chart} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                    />
                    <RechartsTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(v) => formatCurrency(v)}
                          labelFormatter={formatMonth}
                        />
                      }
                    />
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="amount"
                      fill="url(#revenueGrad)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="Belum ada data pendapatan" />
            )}
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Pertumbuhan Pengguna</CardTitle>
                <CardDescription>6 bulan terakhir</CardDescription>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.userGrowth.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <RechartsTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(v) => v.toLocaleString("id-ID")}
                          labelFormatter={formatMonth}
                          valueName="pengguna baru"
                        />
                      }
                    />
                    <defs>
                      <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(221 83% 53%)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(221 83% 53%)"
                      fill="url(#userGrowthGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="Belum ada data pengguna" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Packages + Latest Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Packages */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Paket Populer</CardTitle>
                <CardDescription>Berdasarkan jumlah attempt</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/admin/packages">
                  Lihat semua
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.popularPackages.length > 0 ? (
              <div className="space-y-3">
                {data.popularPackages.map((pkg, i) => (
                  <div key={pkg.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm">{pkg.title}</span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {pkg.attempts.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all"
                          style={{ width: `${(pkg.attempts / maxAttempts) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada data paket
              </p>
            )}
          </CardContent>
        </Card>

        {/* Latest Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
                <CardDescription>5 transaksi terakhir</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/admin/transactions">
                  Lihat semua
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.latestTransactions.length > 0 ? (
              <div className="space-y-4">
                {data.latestTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{tx.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.paidAt
                          ? new Date(tx.paidAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-emerald-600">
                      +{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada transaksi
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Detail Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detail Harian</h3>
          <p className="text-sm text-muted-foreground">Analitik pendapatan dan registrasi harian</p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {detailLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Revenue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Pendapatan Harian</CardTitle>
                {revenueDetail && (
                  <CardDescription>
                    Total: {formatCurrency(revenueDetail.totalRevenue)} dari {revenueDetail.totalTransactions} transaksi
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {revenueDetail && revenueDetail.daily.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueDetail.daily}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={44}
                        />
                        <RechartsTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(v) => formatCurrency(v)}
                            />
                          }
                        />
                        <defs>
                          <linearGradient id="dailyRevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="hsl(var(--primary))"
                          fill="url(#dailyRevGrad)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart message="Belum ada data pendapatan" />
                )}
              </CardContent>
            </Card>

            {/* Daily Registrations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Registrasi Harian</CardTitle>
                {usersDetail && (
                  <CardDescription>
                    {usersDetail.newUsersInPeriod} baru, {usersDetail.activeUsersInPeriod} aktif
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {usersDetail && usersDetail.dailyRegistrations.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usersDetail.dailyRegistrations} barCategoryGap="15%">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={28}
                        />
                        <RechartsTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(v) => v.toLocaleString("id-ID")}
                              valueName="pengguna baru"
                            />
                          }
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(221 83% 53%)"
                          radius={[4, 4, 0, 0]}
                          opacity={0.8}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart message="Belum ada data registrasi" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Method Distribution + Role Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Methods */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Metode Pembayaran</CardTitle>
                    <CardDescription>{period} hari terakhir</CardDescription>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <Wallet className="h-4 w-4 text-violet-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {revenueDetail && revenueDetail.byMethod.length > 0 ? (
                  <div className="space-y-3">
                    {revenueDetail.byMethod.map((m) => {
                      const total = revenueDetail.byMethod.reduce((s, i) => s + i.amount, 0);
                      const pct = total > 0 ? ((m.amount / total) * 100).toFixed(0) : "0";
                      return (
                        <div key={m.method} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span>{m.method}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{pct}%</span>
                              <span className="font-semibold tabular-nums">{formatCurrency(m.amount)}</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-violet-500/70 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada data metode pembayaran
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Distribusi Role</CardTitle>
                    <CardDescription>
                      {usersDetail ? `${usersDetail.totalUsers.toLocaleString("id-ID")} total pengguna` : "Semua pengguna"}
                    </CardDescription>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersDetail && usersDetail.roleDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {usersDetail.roleDistribution.map((r) => {
                      const total = usersDetail.roleDistribution.reduce((s, i) => s + i.count, 0);
                      const pct = total > 0 ? ((r.count / total) * 100).toFixed(1) : "0";
                      return (
                        <div key={r.role} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={roleBadgeColor[r.role] ?? ""}
                            >
                              {r.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{pct}%</span>
                            <span className="min-w-[3rem] text-right text-sm font-semibold tabular-nums">
                              {r.count.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada data role
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
