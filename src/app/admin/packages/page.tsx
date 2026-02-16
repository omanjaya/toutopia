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
import { Plus, Eye } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Paket Ujian",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

export default async function AdminPackagesPage() {
  const packages = await prisma.examPackage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { attempts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paket Ujian</h2>
          <p className="text-muted-foreground">
            Kelola paket try out yang tersedia di platform
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/packages/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Paket
          </Link>
        </Button>
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
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {pkg.category.name}
                </TableCell>
                <TableCell className="text-sm">
                  {pkg.isFree ? (
                    <Badge variant="secondary">Gratis</Badge>
                  ) : (
                    formatCurrency(pkg.price)
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {pkg.totalQuestions} soal
                </TableCell>
                <TableCell className="text-sm">
                  {pkg.durationMinutes} menit
                </TableCell>
                <TableCell className="text-sm">
                  {pkg._count.attempts}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[pkg.status] ?? "secondary"}>
                    {pkg.status}
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
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Belum ada paket ujian. Buat paket pertama untuk mulai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
