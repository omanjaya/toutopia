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
import { Plus, Pencil, Tag, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { PromoDeleteButton } from "./promo-delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Promo",
};

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });

  const now = new Date();
  const activeCount = promos.filter(
    (p) => p.isActive && (!p.validUntil || now <= p.validUntil) && (p.maxUses === null || p.usedCount < p.maxUses)
  ).length;
  const expiredCount = promos.filter((p) => p.validUntil && now > p.validUntil).length;
  const totalUsages = promos.reduce((s, p) => s + p.usedCount, 0);

  const statCards = [
    { title: "Aktif", value: activeCount.toString(), icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Kedaluwarsa", value: expiredCount.toString(), icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Promo", value: promos.length.toString(), icon: Tag, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Penggunaan", value: totalUsages.toLocaleString("id-ID"), icon: XCircle, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
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
            Tambah Promo
          </Link>
        </Button>
      </div>

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

              return (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono text-sm font-semibold">
                    {promo.code}
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
                  <TableCell className="text-sm tabular-nums">
                    {promo.usedCount}
                    {promo.maxUses ? ` / ${promo.maxUses}` : ""}
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
                    <p className="text-sm text-muted-foreground">Belum ada kode promo</p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/promos/new">Buat Promo Pertama</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
