"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

function formatMonth(m: string) {
  const [year, month] = m.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}

export function AdminCharts() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        {data.revenue.chart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pendapatan Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenue.chart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "Pendapatan",
                      ]}
                      labelFormatter={(label) => formatMonth(String(label))}
                    />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Growth Chart */}
        {data.userGrowth.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pertumbuhan Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      formatter={(value) => [value as number, "Pengguna baru"]}
                      labelFormatter={(label) => formatMonth(String(label))}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Packages */}
        {data.popularPackages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paket Populer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.popularPackages.map((pkg, i) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="truncate max-w-[200px]">{pkg.title}</span>
                    </div>
                    <Badge variant="secondary">
                      {pkg.attempts} attempt
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Transactions */}
        {data.latestTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.latestTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{tx.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.paidAt
                          ? new Date(tx.paidAt).toLocaleDateString("id-ID", {
                              dateStyle: "medium",
                            })
                          : "-"}
                      </p>
                    </div>
                    <p className="font-semibold text-emerald-600">
                      +{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
