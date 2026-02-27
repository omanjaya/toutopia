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
import { Plus, Eye, Package, BookOpen, Archive, FileEdit } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Paket Ujian",
};

const statusBadgeClass: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400",
  ARCHIVED: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
};

const statusLabel: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

export default async function AdminPackagesPage() {
  const packages = await prisma.examPackage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { attempts: true } },
    },
  });

  const publishedCount = packages.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = packages.filter((p) => p.status === "DRAFT").length;
  const archivedCount = packages.filter((p) => p.status === "ARCHIVED").length;
  const totalAttempts = packages.reduce((s, p) => s + p._count.attempts, 0);

  const statCards = [
    { title: "Published", value: publishedCount, icon: BookOpen, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Draft", value: draftCount, icon: FileEdit, color: "bg-slate-500/10 text-slate-600" },
    { title: "Archived", value: archivedCount, icon: Archive, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Peserta", value: totalAttempts, icon: Package, color: "bg-blue-500/10 text-blue-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paket Ujian</h2>
          <p className="text-muted-foreground">
            Kelola paket try out yang tersedia di platform
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/packages/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Buat Paket
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
              <div className="text-2xl font-bold">{stat.value.toLocaleString("id-ID")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Paket</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Soal</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  <Link href={`/admin/packages/${pkg.id}`} className="text-sm font-medium hover:underline">
                    {pkg.title}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {pkg.category.name}
                </TableCell>
                <TableCell className="text-sm">
                  {pkg.isFree ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                      Gratis
                    </Badge>
                  ) : (
                    <span className="font-medium">{formatCurrency(pkg.price)}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {pkg.totalQuestions}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {pkg.durationMinutes} min
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {pkg._count.attempts.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClass[pkg.status] ?? ""}>
                    {statusLabel[pkg.status] ?? pkg.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/packages/${pkg.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {packages.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Belum ada paket ujian</p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/packages/new">Buat Paket Pertama</Link>
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
