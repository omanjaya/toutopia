import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaksi — Admin",
};

const statusBadgeClass: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  PENDING: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
  FAILED: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
  EXPIRED: "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400",
  REFUNDED: "bg-violet-500/10 text-violet-700 border-violet-200 dark:text-violet-400",
};

const statusLabel: Record<string, string> = {
  PAID: "Berhasil",
  PENDING: "Menunggu",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Refund",
};

const ITEMS_PER_PAGE = 30;

interface Props {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminTransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status ?? "";
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Prisma.TransactionWhereInput = {};
  if (statusFilter) {
    where.status = statusFilter as Prisma.TransactionWhereInput["status"];
  }
  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const [transactions, total, paidAgg, pendingCount, totalAll] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { title: true } },
      },
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.count({ where: { status: "PENDING" } }),
    prisma.transaction.count(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const totalRevenue = paidAgg._sum.amount ?? 0;
  const paidCount = paidAgg._count;

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (overrides.q ?? q) p.set("q", overrides.q ?? q);
    if (overrides.status ?? statusFilter) p.set("status", overrides.status ?? statusFilter);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/transactions?${p.toString()}`;
  }

  const statCards = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Transaksi Berhasil", value: paidCount.toLocaleString("id-ID"), icon: CheckCircle2, color: "bg-blue-500/10 text-blue-600" },
    { title: "Menunggu Pembayaran", value: pendingCount.toString(), icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Transaksi", value: totalAll.toLocaleString("id-ID"), icon: CreditCard, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transaksi</h2>
        <p className="text-muted-foreground">
          Kelola semua transaksi pembayaran
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form method="GET" action="/admin/transactions" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau email..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <Button type="submit" size="sm">Cari</Button>
        </form>

        <div className="flex gap-1 rounded-lg border p-1">
          {[
            { value: "", label: "Semua" },
            { value: "PAID", label: "Berhasil" },
            { value: "PENDING", label: "Menunggu" },
            { value: "FAILED", label: "Gagal" },
            { value: "EXPIRED", label: "Expired" },
          ].map((s) => (
            <Link
              key={s.value}
              href={buildUrl({ status: s.value, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => {
              const meta = t.metadata as Record<string, string> | null;
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{t.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {t.package?.title ?? meta?.description ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums">
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.paymentMethod ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass[t.status] ?? ""}>
                      {statusLabel[t.status] ?? t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {q || statusFilter ? "Tidak ada transaksi yang sesuai filter" : "Belum ada transaksi"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} transaksi)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Sebelumnya
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
