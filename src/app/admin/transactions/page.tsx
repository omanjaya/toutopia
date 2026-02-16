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
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaksi — Admin",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PAID: "default",
  PENDING: "outline",
  FAILED: "destructive",
  EXPIRED: "secondary",
  REFUNDED: "secondary",
};

const statusLabel: Record<string, string> = {
  PAID: "Berhasil",
  PENDING: "Menunggu",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Refund",
};

export default async function AdminTransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      package: { select: { title: true } },
    },
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = transactions.filter(
    (t) => t.status === "PENDING"
  ).length;

  const paidCount = transactions.filter((t) => t.status === "PAID").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transaksi</h2>
        <p className="text-muted-foreground">
          Kelola semua transaksi pembayaran
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transaksi Berhasil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
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
                  <TableCell className="text-sm font-medium">
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.paymentMethod ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[t.status] ?? "secondary"}>
                      {statusLabel[t.status] ?? t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString("id-ID", {
                      dateStyle: "medium",
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
