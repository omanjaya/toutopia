import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import {
  Plus,
  Pencil,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { formatCurrency } from "@/shared/lib/utils";
import { PromoDeleteButton } from "./promo-delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Promo",
};

const ITEMS_PER_PAGE = 20;

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
  }>;
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminPromosPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const typeFilter = params.type ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Prisma.PromoCodeWhereInput = {};

  if (q) {
    where.code = { contains: q, mode: "insensitive" };
  }

  if (typeFilter === "PERCENTAGE" || typeFilter === "FIXED") {
    where.discountType = typeFilter;
  }

  const now = new Date();

  const [promos, total, activeCount, expiredCount] = await Promise.all([
    prisma.promoCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { _count: { select: { usages: true } } },
    }),
    prisma.promoCode.count({ where }),
    prisma.promoCode.count({
      where: {
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
    }),
    prisma.promoCode.count({
      where: { validUntil: { lt: now } },
    }),
  ]);

  const totalUsages = promos.reduce((s, p) => s + p.usedCount, 0);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    const resolvedQ = "q" in overrides ? overrides.q : q;
    const resolvedType = "type" in overrides ? overrides.type : typeFilter;
    const resolvedPage = overrides.page ?? "1";
    if (resolvedQ) p.set("q", resolvedQ);
    if (resolvedType) p.set("type", resolvedType);
    p.set("page", resolvedPage);
    return `/admin/promos?${p.toString()}`;
  }

  const statCards = [
    { title: "Aktif", value: activeCount.toString(), icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Kedaluwarsa", value: expiredCount.toString(), icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Promo", value: total.toString(), icon: Tag, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Penggunaan", value: totalUsages.toLocaleString("id-ID"), icon: XCircle, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kode Promo</h2>
          <p className="text-muted-foreground">
            Kelola kode promo dan diskon untuk pengguna
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/promos/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Buat Promo
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
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
        <form method="GET" action="/admin/promos" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari kode promo..."
              className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          <Button type="submit" size="sm">Cari</Button>
        </form>

        <div className="flex gap-1 rounded-lg border p-1">
          {[
            { value: "", label: "Semua" },
            { value: "PERCENTAGE", label: "Persentase %" },
            { value: "FIXED", label: "Nominal Rp" },
          ].map((t) => (
            <Link
              key={t.value}
              href={buildUrl({ type: t.value, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Min Pembelian</TableHead>
              <TableHead>Penggunaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Berlaku</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.map((promo) => {
              const isExpired = promo.validUntil && now > promo.validUntil;
              const isExhausted =
                promo.maxUses !== null && promo.usedCount >= promo.maxUses;
              const isExpiringSoon =
                !isExpired &&
                promo.validUntil !== null &&
                promo.validUntil <= sevenDaysFromNow;
              const pct = promo.maxUses
                ? (promo.usedCount / promo.maxUses) * 100
                : 0;

              return (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono text-sm font-semibold">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {promo.code}
                      {isExpiringSoon && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 border-amber-300 text-[10px] px-1.5 py-0 leading-5"
                        >
                          Segera Berakhir
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {promo.discountType === "PERCENTAGE"
                        ? "Persentase"
                        : "Nominal"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">
                    {promo.discountType === "PERCENTAGE"
                      ? `${promo.discountValue}%`
                      : formatCurrency(promo.discountValue)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {promo.minPurchase > 0
                      ? formatCurrency(promo.minPurchase)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            pct >= 100
                              ? "bg-red-500"
                              : pct >= 75
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {promo.usedCount}/{promo.maxUses ?? "∞"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {!promo.isActive ? (
                      <Badge variant="outline" className="bg-slate-500/10 text-slate-700 border-slate-200">Nonaktif</Badge>
                    ) : isExpired ? (
                      <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">Kedaluwarsa</Badge>
                    ) : isExhausted ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">Habis</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(promo.validFrom)} - {formatDate(promo.validUntil)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/promos/${promo.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <PromoDeleteButton
                        promoId={promo.id}
                        promoCode={promo.code}
                        hasUsages={promo._count.usages > 0}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {promos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {q || typeFilter
                        ? "Tidak ada promo yang cocok dengan filter"
                        : "Belum ada kode promo"}
                    </p>
                    {!q && !typeFilter && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/admin/promos/new">Buat Promo Pertama</Link>
                      </Button>
                    )}
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
            Halaman {page} dari {totalPages} ({total} promo)
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
