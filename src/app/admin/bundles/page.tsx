import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { Layers, Package, Users, ToggleLeft } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import { formatCurrency } from "@/shared/lib/utils";
import { CreateBundleButton } from "./create-bundle-button";
import { BundleEditButton } from "./bundle-edit-button";
import { BundleDeleteButton } from "./bundle-delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Bundle Paket | Admin Toutopia" };

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export default async function AdminBundlesPage() {
  const bundles = await prisma.subscriptionBundle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      packages: { select: { id: true, title: true } },
      _count: { select: { subscriptions: true } },
    },
  });

  const totalActive = bundles.filter((b) => b.isActive).length;
  const totalSubscribers = bundles.reduce((s, b) => s + b._count.subscriptions, 0);

  const statCards = [
    { title: "Total Bundle", value: bundles.length, icon: Layers, color: "bg-primary/10 text-primary" },
    { title: "Bundle Aktif", value: totalActive, icon: ToggleLeft, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Total Package", value: bundles.reduce((s, b) => s + b.packages.length, 0), icon: Package, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Subscriber", value: totalSubscribers, icon: Users, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Bundle Paket</h2>
            <p className="text-sm text-muted-foreground">Kelola bundle berlangganan dan paket bundling</p>
          </div>
        </div>
        <CreateBundleButton />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={cardCls}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">{stat.value.toLocaleString("id-ID")}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Nama Bundle</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Harga/Bulan</TableHead>
              <TableHead>Harga/3 Bulan</TableHead>
              <TableHead>Harga/Tahun</TableHead>
              <TableHead>Subscriber</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[88px] pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundles.map((bundle) => (
              <TableRow key={bundle.id} className="hover:bg-muted/40">
                <TableCell className="pl-5">
                  <div>
                    <p className="text-sm font-medium">{bundle.name}</p>
                    {bundle.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{bundle.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {bundle.packages.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : bundle.packages.slice(0, 2).map((pkg) => (
                      <Badge key={pkg.id} className="text-xs bg-muted text-foreground border-0">{pkg.title}</Badge>
                    ))}
                    {bundle.packages.length > 2 && (
                      <Badge className="text-xs bg-muted text-foreground border-0">+{bundle.packages.length - 2}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm tabular-nums">{formatCurrency(bundle.monthlyPrice)}</TableCell>
                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {bundle.quarterlyPrice ? formatCurrency(bundle.quarterlyPrice) : "—"}
                </TableCell>
                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {bundle.yearlyPrice ? formatCurrency(bundle.yearlyPrice) : "—"}
                </TableCell>
                <TableCell className="text-sm tabular-nums">{bundle._count.subscriptions.toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  {bundle.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-xs">Aktif</Badge>
                  ) : (
                    <Badge className="bg-slate-500/10 text-slate-700 border-slate-200 text-xs">Nonaktif</Badge>
                  )}
                </TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center gap-1">
                    <BundleEditButton bundle={bundle} />
                    <BundleDeleteButton bundleId={bundle.id} bundleName={bundle.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {bundles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <Layers className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Belum ada bundle</p>
                      <p className="text-sm text-muted-foreground mt-1">Buat bundle pertama untuk mulai menawarkan langganan</p>
                    </div>
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
