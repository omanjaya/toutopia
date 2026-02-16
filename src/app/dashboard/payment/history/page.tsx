import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
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
  title: "Riwayat Pembayaran",
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

export default async function PaymentHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const credit = await prisma.userCredit.findUnique({
    where: { userId: session.user.id },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      package: { select: { title: true } },
    },
  });

  const creditHistory = await prisma.creditHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Riwayat Pembayaran
        </h2>
        <p className="text-muted-foreground">
          Saldo kredit:{" "}
          <span className="font-semibold">{credit?.balance ?? 0}</span> kredit
        </p>
      </div>

      {/* Credit History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kredit</CardTitle>
        </CardHeader>
        <CardContent>
          {creditHistory.length > 0 ? (
            <div className="space-y-2">
              {creditHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{h.description ?? h.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <span
                    className={
                      h.amount > 0 ? "text-emerald-600 font-semibold" : "text-destructive font-semibold"
                    }
                  >
                    {h.amount > 0 ? "+" : ""}
                    {h.amount} kredit
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum ada riwayat kredit.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
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
                        <Badge
                          variant={statusVariant[t.status] ?? "secondary"}
                        >
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
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Belum ada transaksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
