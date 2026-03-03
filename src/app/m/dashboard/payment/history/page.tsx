import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { getMidtransClientKey } from "@/shared/lib/midtrans";
import { redirect } from "next/navigation";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowLeft,
  Wallet,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Coins,
  Minus,
  Star,
  Clock,
  BookOpen,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import { formatCurrency, cn } from "@/shared/lib/utils";
import { ContinuePaymentButton } from "@/app/dashboard/payment/history/continue-payment-button";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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

function getTransactionType(
  metadata: Record<string, string> | null,
  ebookTitle: string | null
): string {
  if (metadata?.type === "SUBSCRIPTION") return "Langganan";
  if (metadata?.type === "CREDIT_BUNDLE") return "Kredit";
  if (metadata?.type === "SINGLE_PACKAGE") return "Paket";
  if (ebookTitle) return "E-book";
  return "Lainnya";
}

function getTransactionTypeBadgeVariant(
  type: string
): "default" | "secondary" | "outline" {
  if (type === "Langganan") return "default";
  if (type === "Kredit") return "secondary";
  return "outline";
}

interface PaymentHistoryPageProps {
  searchParams: Promise<{ page?: string; tab?: string }>;
}

export default async function MobilePaymentHistoryPage({
  searchParams,
}: PaymentHistoryPageProps): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect("/m/login");

  const params = await searchParams;
  const activeTab = params.tab ?? "transactions";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 15;

  const userId = session.user.id;

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const midtransClientKey = getMidtransClientKey();

  const creditQuery = prisma.userCredit.findUnique({
    where: { userId },
  });

  const subscriptionQuery = prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
    },
    include: { bundle: { select: { name: true } } },
    orderBy: { endDate: "desc" },
  });

  const transactionsQuery = prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      package: { select: { title: true } },
      ebook: { select: { title: true } },
    },
  });

  const totalTransactionsQuery = prisma.transaction.count({
    where: { userId },
  });

  const creditHistoryQuery = prisma.creditHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  type TransactionRow = Awaited<typeof transactionsQuery>[number];
  type CreditHistoryRow = Awaited<typeof creditHistoryQuery>[number];

  const [credit, activeSubscription, transactions, totalTransactions, creditHistory] =
    await Promise.all([
      creditQuery,
      subscriptionQuery,
      transactionsQuery,
      totalTransactionsQuery,
      creditHistoryQuery,
    ] as const);

  const totalPages = Math.ceil(totalTransactions / limit);

  const pendingTransactions = transactions.filter(
    (t: TransactionRow) => t.status === "PENDING" && t.snapToken
  );

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
        {/* Balance / Subscription Card */}
        {activeSubscription ? (
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-300" />
                  <p className="text-xs font-medium text-emerald-100">
                    Langganan Aktif
                  </p>
                </div>
                <p className="mt-1 text-lg font-bold">
                  {activeSubscription.bundle.name}
                </p>
                <p className="mt-0.5 text-xs text-emerald-200">
                  Berlaku hingga{" "}
                  {new Date(activeSubscription.endDate).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Crown className="h-6 w-6 text-amber-300" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl bg-primary text-primary-foreground">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs opacity-80">Saldo Kredit</p>
                <p className="text-2xl font-bold">{credit?.balance ?? 0}</p>
                <p className="text-xs opacity-70">kredit tersedia</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                >
                  <Link href="/m/dashboard/payment">Beli Kredit</Link>
                </Button>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Payments */}
        {pendingTransactions.length > 0 && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">
                Menunggu Pembayaran
              </p>
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-100 text-amber-700 text-[10px]"
              >
                {pendingTransactions.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {pendingTransactions.map((t: TransactionRow) => {
                const meta = t.metadata as Record<string, string> | null;
                const description =
                  t.package?.title ??
                  t.ebook?.title ??
                  meta?.description ??
                  "Pembayaran";
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-amber-200"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatCurrency(t.amount)}
                      </p>
                    </div>
                    <ContinuePaymentButton
                      snapToken={t.snapToken!}
                      midtransUrl={t.midtransUrl ?? ""}
                      midtransClientKey={midtransClientKey}
                      isProduction={isProduction}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                {transactions.map((t: TransactionRow) => {
                  const meta = t.metadata as Record<string, string> | null;
                  const ebookTitle = t.ebook?.title ?? null;
                  const txType = getTransactionType(meta, ebookTitle);
                  const description =
                    t.package?.title ??
                    ebookTitle ??
                    meta?.description ??
                    "Pembayaran";

                  return (
                    <div key={t.id} className={cardCls}>
                      <div className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                          {txType === "Langganan" ? (
                            <Crown className="h-5 w-5 text-amber-500" />
                          ) : txType === "E-book" ? (
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          ) : txType === "Paket" ? (
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {description}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            {t.paymentMethod && (
                              <p className="text-xs text-muted-foreground">
                                {t.paymentMethod}
                              </p>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Badge
                              variant={statusVariant[t.status] ?? "secondary"}
                              className="text-[10px]"
                            >
                              {statusLabel[t.status] ?? t.status}
                            </Badge>
                            <Badge
                              variant={getTransactionTypeBadgeVariant(txType)}
                              className="text-[10px]"
                            >
                              {txType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <p className="text-sm font-bold tabular-nums">
                            {formatCurrency(t.amount)}
                          </p>
                          {t.status === "PENDING" && t.snapToken && (
                            <ContinuePaymentButton
                              snapToken={t.snapToken}
                              midtransUrl={t.midtransUrl ?? ""}
                              midtransClientKey={midtransClientKey}
                              isProduction={isProduction}
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-semibold">Belum ada transaksi</h3>
                <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
                  Transaksi pembelian kredit dan paket akan muncul di sini.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Link href="/m/dashboard/payment">
                    <ShoppingBag className="mr-1.5 h-4 w-4" />
                    Mulai Belanja
                  </Link>
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
                {creditHistory.map((h: CreditHistoryRow) => {
                  const isSubscriptionCredit =
                    h.amount === 999 && h.type === "PURCHASE";
                  const isUsage = h.type === "USAGE";
                  const isBonus =
                    h.type === "BONUS" || h.type === "FREE_SIGNUP";

                  return (
                    <div key={h.id} className={cardCls}>
                      <div className="flex items-center gap-3 p-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            isSubscriptionCredit
                              ? "bg-amber-500/10"
                              : isUsage
                                ? "bg-red-500/10"
                                : isBonus
                                  ? "bg-purple-500/10"
                                  : h.amount > 0
                                    ? "bg-emerald-500/10"
                                    : "bg-red-500/10"
                          )}
                        >
                          {isSubscriptionCredit ? (
                            <Crown className="h-5 w-5 text-amber-500" />
                          ) : isUsage ? (
                            <Minus className="h-5 w-5 text-red-500" />
                          ) : isBonus ? (
                            <Star className="h-5 w-5 text-purple-500" />
                          ) : h.amount > 0 ? (
                            <Coins className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Minus className="h-5 w-5 text-red-500" />
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
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Receipt className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-semibold">
                  Belum ada riwayat kredit
                </h3>
                <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
                  Kredit akan muncul di sini setelah Anda melakukan pembelian.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Link href="/m/dashboard/payment">
                    <Coins className="mr-1.5 h-4 w-4" />
                    Beli Kredit
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
