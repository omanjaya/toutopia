"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  ArrowUpRight,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/lib/utils";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

// ─── Type Interfaces ──────────────────────────────────────────────────────────

interface OverviewData {
  counts: Record<string, number>;
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

interface RevenueData {
  totalRevenue: number;
  totalTransactions: number;
  daily: { date: string; amount: number; count: number }[];
  byMethod: { method: string; amount: number }[];
}

interface UsersData {
  totalUsers: number;
  newUsersInPeriod: number;
  activeUsersInPeriod: number;
  dailyRegistrations: { date: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
}

type ActiveTab = "revenue" | "users" | "packages";

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatRp(v: number): string {
  return `Rp ${(v / 1000).toFixed(0)}k`;
}

function formatDate(d: string): string {
  return d.slice(5).replace("-", "/");
}

function formatMonth(m: string): string {
  const [year, month] = m.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, sub, icon, iconBg }: StatCardProps) {
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
  formatter: (value: number) => string;
  labelFormatter?: (label: string) => string;
  valueName?: string;
}

function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  valueName,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">
        {labelFormatter ? labelFormatter(String(label)) : label}
      </p>
      <p className="text-sm font-semibold">
        {formatter(payload[0].value)}
        {valueName && (
          <span className="ml-1 font-normal text-muted-foreground">
            {valueName}
          </span>
        )}
      </p>
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

// ─── Period Options ───────────────────────────────────────────────────────────

const periodOptions = [
  { label: "7 hari", value: 7 },
  { label: "30 hari", value: 30 },
  { label: "90 hari", value: 90 },
  { label: "1 tahun", value: 365 },
];

const roleBadgeColor: Record<string, string> = {
  SUPER_ADMIN:
    "bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20",
  ADMIN:
    "bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20",
  TEACHER:
    "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20",
  USER:
    "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-500/20",
  STUDENT:
    "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-500/20",
};

// ─── Tab: Revenue ─────────────────────────────────────────────────────────────

interface RevenueTabProps {
  revenueData: RevenueData | null;
  loading: boolean;
  days: number;
}

function RevenueTab({ revenueData, loading, days }: RevenueTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const avgPerTransaction =
    revenueData && revenueData.totalTransactions > 0
      ? revenueData.totalRevenue / revenueData.totalTransactions
      : 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Pendapatan"
          value={revenueData ? formatCurrency(revenueData.totalRevenue) : "Rp 0"}
          sub={`${days} hari terakhir`}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label="Total Transaksi"
          value={
            revenueData
              ? revenueData.totalTransactions.toLocaleString("id-ID")
              : "0"
          }
          sub="transaksi berhasil"
          icon={<CreditCard className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Rata-rata per Transaksi"
          value={formatCurrency(avgPerTransaction)}
          sub="per transaksi"
          icon={<ArrowUpRight className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Revenue Area Chart */}
        <div className={cardCls}>
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-sm font-semibold">Pendapatan Harian</p>
            {revenueData && (
              <p className="text-xs text-muted-foreground">
                Total:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(revenueData.totalRevenue)}
                </span>{" "}
                dari {revenueData.totalTransactions} transaksi
              </p>
            )}
          </div>
          <div className="p-5">
            {revenueData && revenueData.daily.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData.daily}>
                    <defs>
                      <linearGradient
                        id="areaRevGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/50"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatRp}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                    />
                    <RechartsTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(v) => formatCurrency(v)}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      fill="url(#areaRevGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="Belum ada data pendapatan" />
            )}
          </div>
        </div>

        {/* Revenue by Payment Method Bar Chart */}
        <div className={cardCls}>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Metode Pembayaran</p>
              <p className="text-xs text-muted-foreground">
                {days} hari terakhir
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <CreditCard className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          <div className="p-5">
            {revenueData && revenueData.byMethod.length > 0 ? (
              <>
                <div className="mb-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData.byMethod}
                      barCategoryGap="20%"
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted/50"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tickFormatter={formatRp}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="method"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <RechartsTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(v) => formatCurrency(v)}
                          />
                        }
                      />
                      <Bar
                        dataKey="amount"
                        fill="#8b5cf6"
                        radius={[0, 4, 4, 0]}
                        opacity={0.85}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 border-t border-border/60 pt-4">
                  {revenueData.byMethod.map((m) => {
                    const total = revenueData.byMethod.reduce(
                      (s, i) => s + i.amount,
                      0,
                    );
                    const pct =
                      total > 0
                        ? ((m.amount / total) * 100).toFixed(1)
                        : "0";
                    return (
                      <div
                        key={m.method}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {m.method}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {pct}%
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatCurrency(m.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <EmptyChart message="Belum ada data metode pembayaran" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

interface UsersTabProps {
  usersData: UsersData | null;
  loading: boolean;
  days: number;
}

function UsersTab({ usersData, loading, days }: UsersTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total User"
          value={
            usersData
              ? usersData.totalUsers.toLocaleString("id-ID")
              : "0"
          }
          sub="terdaftar"
          icon={<Users className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="User Baru"
          value={
            usersData
              ? usersData.newUsersInPeriod.toLocaleString("id-ID")
              : "0"
          }
          sub={`${days} hari terakhir`}
          icon={<ArrowUpRight className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label="User Aktif"
          value={
            usersData
              ? usersData.activeUsersInPeriod.toLocaleString("id-ID")
              : "0"
          }
          sub={`${days} hari terakhir`}
          icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-500/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Registrations Line Chart */}
        <div className={cardCls}>
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-sm font-semibold">Registrasi Harian</p>
            {usersData && (
              <p className="text-xs text-muted-foreground">
                {usersData.newUsersInPeriod} pengguna baru dalam {days} hari
              </p>
            )}
          </div>
          <div className="p-5">
            {usersData && usersData.dailyRegistrations.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usersData.dailyRegistrations}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/50"
                      vertical={false}
                    />
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
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="Belum ada data registrasi" />
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className={cardCls}>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Distribusi Role</p>
              <p className="text-xs text-muted-foreground">
                {usersData
                  ? `${usersData.totalUsers.toLocaleString("id-ID")} total pengguna`
                  : "Semua pengguna"}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="p-5">
            {usersData && usersData.roleDistribution.length > 0 ? (
              <div className="space-y-4">
                {usersData.roleDistribution.map((r) => {
                  const total = usersData.roleDistribution.reduce(
                    (s, i) => s + i.count,
                    0,
                  );
                  const pct =
                    total > 0
                      ? ((r.count / total) * 100).toFixed(1)
                      : "0";
                  return (
                    <div key={r.role} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            roleBadgeColor[r.role] ??
                            "bg-slate-500/10 text-slate-600 border-slate-200"
                          }
                        >
                          {r.role}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {pct}%
                          </span>
                          <span className="min-w-[3rem] text-right text-sm font-semibold tabular-nums">
                            {r.count.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-blue-500/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
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
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Packages ────────────────────────────────────────────────────────────

interface PackagesTabProps {
  overviewData: OverviewData | null;
  loading: boolean;
}

function PackagesTab({ overviewData, loading }: PackagesTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const packages = overviewData?.popularPackages.slice(0, 10) ?? [];
  const transactions = overviewData?.latestTransactions ?? [];
  const maxAttempts = Math.max(...packages.map((p) => p.attempts), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Packages by Attempt */}
        <div className={cardCls}>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Paket Populer</p>
              <p className="text-xs text-muted-foreground">
                Top 10 berdasarkan jumlah attempt
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/admin/packages">
                Lihat semua
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="p-5">
            {packages.length > 0 ? (
              <div className="space-y-3">
                {packages.map((pkg, i) => (
                  <div key={pkg.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold tabular-nums">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm">{pkg.title}</span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {pkg.attempts.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-violet-500/70 transition-all"
                          style={{
                            width: `${(pkg.attempts / maxAttempts) * 100}%`,
                          }}
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
          </div>
        </div>

        {/* Latest Transactions */}
        <div className={cardCls}>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Transaksi Terbaru</p>
              <p className="text-xs text-muted-foreground">
                5 transaksi terakhir
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/admin/transactions">
                Lihat semua
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="p-5">
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {tx.userName}
                      </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("revenue");
  const [days, setDays] = useState<number>(30);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch overview once
  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await fetch("/api/admin/analytics/overview");
        const result = await res.json() as { success: boolean; data: OverviewData };
        if (res.ok && result.success) setOverviewData(result.data);
      } catch (err) {
        console.error("Failed to fetch overview analytics:", err);
      } finally {
        setOverviewLoading(false);
      }
    }
    void fetchOverview();
  }, []);

  // Fetch detail data when days changes
  const fetchDetails = useCallback(async () => {
    setDetailLoading(true);
    try {
      const [revRes, usrRes] = await Promise.all([
        fetch(`/api/admin/analytics/revenue?days=${days}`),
        fetch(`/api/admin/analytics/users?days=${days}`),
      ]);
      const [revJson, usrJson] = await Promise.all([
        revRes.json() as Promise<{ success: boolean; data: RevenueData }>,
        usrRes.json() as Promise<{ success: boolean; data: UsersData }>,
      ]);
      if (revJson.success) setRevenueData(revJson.data);
      if (usrJson.success) setUsersData(usrJson.data);
    } catch (err) {
      console.error("Failed to fetch detail analytics:", err);
    } finally {
      setDetailLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "revenue",
      label: "Revenue",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      key: "users",
      label: "Pengguna",
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "packages",
      label: "Paket",
      icon: <Package className="h-4 w-4" />,
    },
  ];

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Memuat analitik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar: tabs + period selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab navigation */}
        <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period selector — only relevant for revenue & users tabs */}
        {activeTab !== "packages" && (
          <div className="flex gap-1 rounded-lg border p-1">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setDays(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overview summary bar (always visible) */}
      {overviewData && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Pendapatan"
            value={formatCurrency(overviewData.revenue.total)}
            sub="sepanjang masa"
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-500/10"
          />
          <StatCard
            label="Total Transaksi"
            value={overviewData.revenue.paidTransactions.toLocaleString("id-ID")}
            sub="berhasil"
            icon={<CreditCard className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-500/10"
          />
          <StatCard
            label="Total Paket"
            value={
              (overviewData.counts["packages"] ?? 0).toLocaleString("id-ID")
            }
            sub="paket ujian"
            icon={<Package className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-500/10"
          />
          <StatCard
            label="Total Pengguna"
            value={
              (overviewData.counts["users"] ?? 0).toLocaleString("id-ID")
            }
            sub="terdaftar"
            icon={<BarChart2 className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-500/10"
          />
        </div>
      )}

      {/* Tab content */}
      {activeTab === "revenue" && (
        <RevenueTab
          revenueData={revenueData}
          loading={detailLoading}
          days={days}
        />
      )}
      {activeTab === "users" && (
        <UsersTab
          usersData={usersData}
          loading={detailLoading}
          days={days}
        />
      )}
      {activeTab === "packages" && (
        <PackagesTab
          overviewData={overviewData}
          loading={overviewLoading}
        />
      )}
    </div>
  );
}
