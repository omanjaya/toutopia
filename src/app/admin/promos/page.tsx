import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
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
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { formatCurrency } from "@/shared/lib/utils";
import { PromoDeleteButton } from "./promo-delete-button";
import { PromoToggleButton } from "./promo-toggle-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Promo",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const ITEMS_PER_PAGE = 20;

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
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
  const statusFilter = params.status ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const now = new Date();

  const where: Prisma.PromoCodeWhereInput = {};
  if (q) where.code = { contains: q, mode: "insensitive" };
  if (typeFilter === "PERCENTAGE" || typeFilter === "FIXED") where.discountType = typeFilter;
  if (statusFilter === "active") {
    where.isActive = true;
    where.OR = [{ validUntil: null }, { validUntil: { gt: now } }];
  } else if (statusFilter === "expired") {
    where.validUntil = { lt: now };
  } else if (statusFilter === "inactive") {
    where.isActive = false;
  }

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
      where: { isActive: true, OR: [{ validUntil: null }, { validUntil: { gt: now } }] },
    }),
    prisma.promoCode.count({ where: { validUntil: { lt: now } } }),
  ]);

  const totalUsages = promos.reduce((s, p) => s + p.usedCount, 0);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    const resolvedQ = "q" in overrides ? overrides.q : q;
    const resolvedType = "type" in overrides ? overrides.type : typeFilter;
    const resolvedStatus = "status" in overrides ? overrides.status : statusFilter;
    const resolvedPage = overrides.page ?? "1";
    if (resolvedQ) p.set("q", resolvedQ);
    if (resolvedType) p.set("type", resolvedType);
    if (resolvedStatus) p.set("status", resolvedStatus);
    p.set("page", resolvedPage);
    return `/admin/promos?${p.toString()}`;
  }

  const statCards = [
    { title: "Aktif", value: activeCount, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Kedaluwarsa", value: expiredCount, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Promo", value: total, icon: Tag, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Penggunaan", value: totalUsages, icon: BarChart3, color: "bg-violet-500/10 text-violet-600" },
  ];

  const hasFilter = !!(q || typeFilter || statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Kode Promo</h2>
            <p className="text-sm text-muted-foreground">Kelola kode promo dan diskon</p>
          </div>
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
          <div key={stat.title} className={cardCls}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {stat.value.toLocaleString("id-ID")}
                </p>
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
          <form method="GET" action="/admin/promos" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari kode promo..."
                className="h-9 w-48 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            <Button type="submit" size="sm">Cari</Button>
          </form>

          <div className="h-5 w-px bg-border/60" />

          <div className="flex gap-1 rounded-lg border p-1">
            {[
              { value: "", label: "Semua Status" },
              { value: "active", label: "Aktif" },
              { value: "expired", label: "Kadaluarsa" },
              { value: "inactive", label: "Nonaktif" },
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

          <div className="h-5 w-px bg-border/60" />

          <div className="flex gap-1 rounded-lg border p-1">
            {[
              { value: "", label: "Semua Tipe" },
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

          {hasFilter && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" asChild>
              <Link href="/admin/promos">Reset</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Kode</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Min Pembelian</TableHead>
              <TableHead>Penggunaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Berlaku</TableHead>
              <TableHead className="w-[120px] pr-5">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.map((promo) => {
              const isExpired = promo.validUntil && now > promo.validUntil;
              const isExhausted = promo.maxUses !== null && promo.usedCount >= promo.maxUses;
              const isExpiringSoon =
                !isExpired &&
                promo.validUntil !== null &&
                promo.validUntil <= sevenDaysFromNow;
              const pct = promo.maxUses ? (promo.usedCount / promo.maxUses) * 100 : 0;

              return (
                <TableRow key={promo.id} className="hover:bg-muted/40">
                  <TableCell className="pl-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-sm font-semibold">{promo.code}</span>
                      {isExpiringSoon && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 border-amber-300 px-1.5 py-0 text-[10px] leading-5"
                        >
                          Segera Berakhir
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {promo.discountType === "PERCENTAGE" ? "Persentase" : "Nominal"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums">
                    {promo.discountType === "PERCENTAGE"
                      ? `${promo.discountValue}%`
                      : formatCurrency(promo.discountValue)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {promo.minPurchase > 0 ? formatCurrency(promo.minPurchase) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[100px] items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted">
                        <div
                          className={`h-1.5 rounded-full ${
                            pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                        {promo.usedCount}/{promo.maxUses ?? "∞"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {!promo.isActive ? (
                      <Badge variant="outline" className="text-xs bg-slate-500/10 text-slate-700 border-slate-200">Nonaktif</Badge>
                    ) : isExpired ? (
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-200">Kedaluwarsa</Badge>
                    ) : isExhausted ? (
                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-200">Habis</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-200">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(promo.validFrom)} – {formatDate(promo.validUntil)}
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center gap-1">
                      <PromoToggleButton promoId={promo.id} isActive={promo.isActive} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/promos/${promo.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
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
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <Tag className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {hasFilter ? "Tidak ada promo yang cocok" : "Belum ada kode promo"}
                      </p>
                      {!hasFilter && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/admin/promos/new">
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              Buat Promo Pertama
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
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
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> promo
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
