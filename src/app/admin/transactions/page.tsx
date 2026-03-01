import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
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
  Banknote,
  CalendarRange,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import type { Prisma } from "@prisma/client";
import { ExportButton } from "./export-button";
import { TransactionsTable } from "./transactions-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaksi — Admin",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const ITEMS_PER_PAGE = 30;

interface Props {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
    from?: string;
    to?: string;
    sort?: string;
  }>;
}

export default async function AdminTransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status ?? "";
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const from = params.from ?? "";
  const to = params.to ?? "";
  const sort = params.sort ?? "newest";

  const where: Prisma.TransactionWhereInput = {};
  if (statusFilter) where.status = statusFilter as Prisma.TransactionWhereInput["status"];
  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }
  if (from || to) {
    where.createdAt = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to + "T23:59:59") }),
    };
  }

  const orderBy: Prisma.TransactionOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" }
    : sort === "highest" ? { amount: "desc" }
    : sort === "lowest" ? { amount: "asc" }
    : { createdAt: "desc" };

  // Start of today in WIB (UTC+7)
  const nowUtc = new Date();
  const startOfToday = new Date(
    Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), -7)
  );

  const [transactions, total, paidAgg, pendingCount, totalAll, todayRevAgg] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
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
    prisma.transaction.aggregate({
      where: { status: "PAID", paidAt: { gte: startOfToday } },
      _sum: { amount: true },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const totalRevenue = paidAgg._sum.amount ?? 0;
  const paidCount = paidAgg._count;
  const todayRevenue = todayRevAgg._sum.amount ?? 0;

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (overrides.q ?? q) p.set("q", overrides.q ?? q);
    if (overrides.status ?? statusFilter) p.set("status", overrides.status ?? statusFilter);
    if (overrides.sort ?? sort) p.set("sort", overrides.sort ?? sort);
    if (overrides.from ?? from) p.set("from", overrides.from ?? from);
    if (overrides.to ?? to) p.set("to", overrides.to ?? to);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/transactions?${p.toString()}`;
  }

  const statCards = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Hari Ini", value: formatCurrency(todayRevenue), icon: Banknote, color: "bg-teal-500/10 text-teal-600" },
    { title: "Transaksi Berhasil", value: paidCount.toLocaleString("id-ID"), icon: CheckCircle2, color: "bg-blue-500/10 text-blue-600" },
    { title: "Menunggu Bayar", value: pendingCount.toString(), icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Transaksi", value: totalAll.toLocaleString("id-ID"), icon: CreditCard, color: "bg-violet-500/10 text-violet-600" },
  ];

  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "highest", label: "Terbesar" },
    { value: "lowest", label: "Terkecil" },
  ];

  const hasFilter = !!(q || statusFilter || from || to);

  // Cast metadata to the shape expected by TransactionsTable
  const tableRows = transactions.map((t) => ({
    ...t,
    metadata: t.metadata as Record<string, string> | null,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Transaksi</h2>
            <p className="text-sm text-muted-foreground">Kelola semua transaksi pembayaran</p>
          </div>
        </div>
        <ExportButton q={q} status={statusFilter} from={from} to={to} sort={sort} />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.title} className={cardCls}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-xl font-bold tabular-nums">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form method="GET" action="/admin/transactions" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama atau email..."
                className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
            {from && <input type="hidden" name="from" value={from} />}
            {to && <input type="hidden" name="to" value={to} />}
            <Button type="submit" size="sm">Cari</Button>
          </form>

          <div className="h-5 w-px bg-border/60" />

          {/* Date range */}
          <form method="GET" action="/admin/transactions" className="flex items-center gap-2">
            {q && <input type="hidden" name="q" value={q} />}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
            <input type="hidden" name="page" value="1" />
            <div className="flex items-center gap-1.5">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">–</span>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            <Button type="submit" size="sm" variant="outline">Filter</Button>
            {(from || to) && (
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href={buildUrl({ from: "", to: "", page: "1" })}>Reset</Link>
              </Button>
            )}
          </form>

          <div className="h-5 w-px bg-border/60" />

          {/* Status tabs */}
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

          {/* Sort pills */}
          <div className="flex gap-1 rounded-lg border p-1">
            {sortOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: "1" })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {hasFilter && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" asChild>
              <Link href="/admin/transactions">Reset Semua</Link>
            </Button>
          )}
        </div>

        {hasFilter && (
          <p className="mt-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            Menampilkan{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> hasil
            {q && <> untuk &ldquo;{q}&rdquo;</>}
          </p>
        )}
      </div>

      {/* Table */}
      <TransactionsTable transactions={tableRows} hasFilter={hasFilter} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> transaksi
          </p>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
              </Button>
            )}
            <span className="min-w-[60px] text-center text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
