import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowLeft,
  Wallet,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency, cn } from "@/shared/lib/utils";

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

interface PaymentHistoryPageProps {
  searchParams: Promise<{ page?: string; tab?: string }>;
}

export default async function MobilePaymentHistoryPage({
  searchParams,
}: PaymentHistoryPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/m/login");

  const params = await searchParams;
  const activeTab = params.tab ?? "transactions";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 15;

  const userId = session.user.id;

  const [credit, transactions, totalTransactions, creditHistory] =
    await Promise.all([
      prisma.userCredit.findUnique({
        where: { userId },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          package: { select: { title: true } },
        },
      }),
      prisma.transaction.count({ where: { userId } }),
      prisma.creditHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

  const totalPages = Math.ceil(totalTransactions / limit);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/m/dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Riwayat Pembayaran</h1>
      </div>

      <div className="px-4 pt-5">
        {/* Balance Card */}
        <Card className="mb-5 border-0 bg-primary text-primary-foreground shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs opacity-80">Saldo Kredit</p>
              <p className="text-2xl font-bold">{credit?.balance ?? 0}</p>
              <p className="text-xs opacity-70">kredit tersedia</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15">
              <Wallet className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Tab Toggle */}
        <div className="mb-4 flex gap-2 rounded-xl bg-muted p-1">
          <Link
            href="/m/dashboard/payment/history?tab=transactions"
            className={cn(
              "flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors",
              activeTab === "transactions"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Transaksi
          </Link>
          <Link
            href="/m/dashboard/payment/history?tab=credits"
            className={cn(
              "flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors",
              activeTab === "credits"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Riwayat Kredit
          </Link>
        </div>

        {/* Transaction Tab */}
        {activeTab === "transactions" && (
          <>
            {transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((t) => {
                  const meta = t.metadata as Record<string, string> | null;
                  return (
                    <Card key={t.id} className="border-0 shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {t.package?.title ?? meta?.description ?? "Pembayaran"}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            {t.paymentMethod && (
                              <p className="text-xs text-muted-foreground">
                                {t.paymentMethod}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={statusVariant[t.status] ?? "secondary"}
                            className="mt-1.5 text-[10px]"
                          >
                            {statusLabel[t.status] ?? t.status}
                          </Badge>
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums">
                          {formatCurrency(t.amount)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-semibold">Belum ada transaksi</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Transaksi pembayaran akan muncul di sini.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Link href="/m/dashboard/payment">Beli Paket</Link>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                {page > 1 ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/m/dashboard/payment/history?tab=transactions&page=${page - 1}`}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Sebelumnya
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Sebelumnya
                  </Button>
                )}

                <span className="text-sm text-muted-foreground tabular-nums">
                  {page} / {totalPages}
                </span>

                {page < totalPages ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/m/dashboard/payment/history?tab=transactions&page=${page + 1}`}
                    >
                      Selanjutnya
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Selanjutnya
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Credit History Tab */}
        {activeTab === "credits" && (
          <>
            {creditHistory.length > 0 ? (
              <div className="space-y-2">
                {creditHistory.map((h) => (
                  <Card key={h.id} className="border-0 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          h.amount > 0
                            ? "bg-emerald-500/10"
                            : "bg-red-500/10"
                        )}
                      >
                        {h.amount > 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {h.description ?? h.type}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(h.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-bold tabular-nums",
                          h.amount > 0
                            ? "text-emerald-600"
                            : "text-red-500"
                        )}
                      >
                        {h.amount > 0 ? "+" : ""}
                        {h.amount} kredit
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Wallet className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-semibold">
                  Belum ada riwayat kredit
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Perubahan kredit akan tercatat di sini.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
