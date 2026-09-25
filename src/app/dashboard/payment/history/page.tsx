import type { Metadata } from "next";
import type { Prisma, CreditType } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { getMidtransClientKey } from "@/shared/lib/midtrans";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency, cn } from "@/shared/lib/utils";
import {
  Wallet,
  Clock,
  Receipt,
  CreditCard,
  ArrowRight,
  Crown,
  Coins,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  Minus,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { ContinuePaymentButton } from "./continue-payment-button";

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

const planLabel: Record<string, string> = {
  MONTHLY: "Bulanan",
  QUARTERLY: "Triwulan",
  YEARLY: "Tahunan",
};

interface TransactionTypeInfo {
  label: string;
  variant: "default" | "secondary" | "outline";
}

function getTransactionTypeLabel(
  metadata: Record<string, string> | null,
  hasEbook: boolean
): TransactionTypeInfo {
  if (hasEbook) {
    return { label: "E-book", variant: "outline" };
  }

  const type = metadata?.type;
  switch (type) {
    case "SUBSCRIPTION":
      return { label: "Langganan", variant: "secondary" };
    case "CREDIT_BUNDLE":
      return { label: "Kredit", variant: "outline" };
    case "SINGLE_PACKAGE":
      return { label: "Paket", variant: "default" };
    default:
      return { label: "Lainnya", variant: "outline" };
  }
}

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    package: { select: { title: true } };
    ebook: { select: { title: true } };
  };
}>;

type SubscriptionWithBundle = Prisma.SubscriptionGetPayload<{
  include: {
    bundle: { select: { name: true } };
  };
}>;

interface CreditHistoryRow {
  id: string;
  userId: string;
  amount: number;
  type: CreditType;
  description: string | null;
  referenceId: string | null;
  createdAt: Date;
}

interface PageProps {
  searchParams: Promise<{ page?: string; tab?: string }>;
}

export default async function PaymentHistoryPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const activeTab = params.tab ?? "transactions";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 15;

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const midtransClientKey = getMidtransClientKey();

  const userId = session.user.id;

  const [credit, activeSubscription, transactions, totalTransactions, creditHistory] =
    await Promise.all([
      prisma.userCredit.findUnique({ where: { userId } }),
      prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          endDate: { gt: new Date() },
        },
        include: {
          bundle: { select: { name: true } },
        },
        orderBy: { endDate: "desc" },
      }) as Promise<SubscriptionWithBundle | null>,
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          package: { select: { title: true } },
          ebook: { select: { title: true } },
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

  const pendingTransactions = transactions.filter(
    (t: TransactionWithRelations) => t.status === "PENDING" && t.snapToken
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:min-h-0 md:pb-0">
      <div className="space-y-5 px-4 pt-5 md:space-y-6 md:px-0 md:pt-0">
        {/* Header + Credit Balance / Subscription Card */}
        {/* Desktop header */}
        <div className="hidden flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:flex">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Riwayat Pembayaran
            </h2>
            <p className="text-sm text-muted-foreground">
              Lihat saldo, riwayat kredit, dan transaksi Anda.
            </p>
          </div>

          {activeSubscription ? (
            <div
              className={`${cardCls} flex items-center gap-4 border-emerald-200 px-5 py-4 ring-emerald-500/20`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Crown className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Langganan Aktif</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold">
                    {activeSubscription.bundle?.name ??
                      planLabel[activeSubscription.plan] ??
                      activeSubscription.plan}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {planLabel[activeSubscription.plan] ??
                      activeSubscription.plan}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Berlaku hingga{" "}
                  {new Date(activeSubscription.endDate).toLocaleDateString(
                    "id-ID",
                    { dateStyle: "medium" }
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Saldo:{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {credit?.balance ?? 0}
                  </span>{" "}
                  kredit
                </p>
              </div>
            </div>
          ) : (
            <div className={`${cardCls} flex items-center gap-4 px-5 py-4`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo Kredit</p>
                <p className="text-xl font-bold tabular-nums">
                  {credit?.balance ?? 0}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    kredit
                  </span>
                </p>
              </div>
              <Button asChild size="sm" className="ml-4">
                <Link href="/dashboard/payment">
                  Beli Kredit
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile balance / subscription card */}
        {activeSubscription ? (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white md:hidden">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-300" />
                  <p className="text-xs font-medium text-emerald-100">
                    Langganan Aktif
                  </p>
                </div>
                <p className="mt-1 text-lg font-bold">
                  {activeSubscription.bundle?.name ??
                    planLabel[activeSubscription.plan] ??
                    activeSubscription.plan}
                </p>
                <p className="mt-0.5 text-xs text-emerald-200">
                  Berlaku hingga{" "}
                  {new Date(activeSubscription.endDate).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Crown className="h-6 w-6 text-amber-300" />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-primary text-primary-foreground md:hidden">
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
                  <Link href="/dashboard/payment">Beli Kredit</Link>
                </Button>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Payments Section */}
        {pendingTransactions.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 md:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 md:h-5 md:w-5" />
              <h3 className="text-sm font-semibold text-amber-800">
                Menunggu Pembayaran
              </h3>
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-100 text-[10px] text-amber-700 md:text-xs"
              >
                {pendingTransactions.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {pendingTransactions.map((t: TransactionWithRelations) => {
                const meta = t.metadata as Record<string, string> | null;
                const description =
                  t.package?.title ?? t.ebook?.title ?? meta?.description ?? "Pembayaran";
                const typeInfo = getTransactionTypeLabel(meta, !!t.ebookId);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-amber-200 md:rounded-lg md:px-4 md:py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {description}
                        </p>
                        <Badge
                          variant={typeInfo.variant}
                          className="hidden shrink-0 text-[10px] md:inline-flex"
                        >
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatCurrency(t.amount)}</span>
                        <span>&middot;</span>
                        <span>
                          {new Date(t.createdAt).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>
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

        {/* Tab Toggle — shown on mobile, used on all sizes */}
        <div className="flex gap-2 rounded-xl bg-muted p-1">
          <Link
            href="/dashboard/payment/history?tab=transactions"
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
            href="/dashboard/payment/history?tab=credits"
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
              <>
                {/* Mobile: card list */}
                <div className="space-y-2 md:hidden">
                  {transactions.map((t: TransactionWithRelations) => {
                    const meta = t.metadata as Record<string, string> | null;
                    const ebookTitle = t.ebook?.title ?? null;
                    const typeInfo = getTransactionTypeLabel(meta, !!t.ebookId);
                    const description =
                      t.package?.title ?? ebookTitle ?? meta?.description ?? "Pembayaran";

                    return (
                      <div key={t.id} className={cardCls}>
                        <div className="flex items-center gap-3 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            {typeInfo.label === "Langganan" ? (
                              <Crown className="h-5 w-5 text-amber-500" />
                            ) : typeInfo.label === "E-book" ? (
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            ) : typeInfo.label === "Paket" ? (
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
                                  { day: "numeric", month: "short", year: "numeric" }
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
                                variant={typeInfo.variant}
                                className="text-[10px]"
                              >
                                {typeInfo.label}
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

                {/* Desktop: table */}
                <div className="hidden md:block">
                  <div className={cardCls}>
                    <div className="px-6 pt-6 pb-2">
                      <h3 className="text-lg font-semibold tracking-tight">
                        Riwayat Transaksi
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Deskripsi</TableHead>
                              <TableHead>Tipe</TableHead>
                              <TableHead>Jumlah</TableHead>
                              <TableHead>Metode</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((t: TransactionWithRelations) => {
                              const meta = t.metadata as Record<string, string> | null;
                              const description =
                                t.package?.title ??
                                t.ebook?.title ??
                                meta?.description ??
                                "-";
                              const typeInfo = getTransactionTypeLabel(meta, !!t.ebookId);

                              return (
                                <TableRow key={t.id}>
                                  <TableCell className="text-sm">
                                    {description}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={typeInfo.variant} className="text-xs">
                                      {typeInfo.label}
                                    </Badge>
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
                                  <TableCell>
                                    <TransactionAction
                                      status={t.status}
                                      snapToken={t.snapToken}
                                      midtransUrl={t.midtransUrl}
                                      midtransId={t.midtransId}
                                      midtransClientKey={midtransClientKey}
                                      isProduction={isProduction}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-12 text-center md:py-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted md:h-12 md:w-12 md:rounded-full">
                  <CreditCard className="h-7 w-7 text-muted-foreground/50 md:h-6 md:w-6 md:text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold md:text-sm">
                  Belum ada transaksi
                </h3>
                <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
                  Transaksi pembelian kredit dan paket akan muncul di sini.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/dashboard/payment">
                    <ShoppingBag className="mr-1.5 h-4 w-4" />
                    Mulai Belanja
                  </Link>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                {page > 1 ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/dashboard/payment/history?tab=transactions&page=${page - 1}`}
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
                      href={`/dashboard/payment/history?tab=transactions&page=${page + 1}`}
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
              <>
                {/* Mobile: card list */}
                <div className="space-y-2 md:hidden">
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
                              {new Date(h.createdAt).toLocaleDateString(
                                "id-ID",
                                { day: "numeric", month: "short", year: "numeric" }
                              )}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-sm font-bold tabular-nums",
                              h.amount > 0 ? "text-emerald-600" : "text-red-500"
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

                {/* Desktop: inline list */}
                <div className="hidden md:block">
                  <div className={cardCls}>
                    <div className="px-6 pt-6 pb-2">
                      <h3 className="text-lg font-semibold tracking-tight">
                        Riwayat Kredit
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-2">
                        {creditHistory.map((h: CreditHistoryRow) => {
                          const isSubscriptionCredit =
                            h.amount === 999 && h.type === "PURCHASE";

                          return (
                            <div
                              key={h.id}
                              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    isSubscriptionCredit
                                      ? "bg-emerald-100"
                                      : h.type === "USAGE"
                                        ? "bg-red-100"
                                        : h.type === "BONUS" || h.type === "FREE_SIGNUP"
                                          ? "bg-amber-100"
                                          : "bg-primary/10"
                                  }`}
                                >
                                  <CreditHistoryIcon
                                    type={h.type}
                                    isSubscriptionCredit={isSubscriptionCredit}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {h.description ?? h.type}
                                    </p>
                                    {isSubscriptionCredit && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        Langganan
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(h.createdAt).toLocaleDateString(
                                      "id-ID",
                                      { dateStyle: "medium" }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={
                                  h.amount > 0
                                    ? "font-semibold text-emerald-600"
                                    : "font-semibold text-destructive"
                                }
                              >
                                {h.amount > 0 ? "+" : ""}
                                {h.amount} kredit
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-12 text-center md:py-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted md:h-12 md:w-12 md:rounded-full">
                  <Receipt className="h-7 w-7 text-muted-foreground/50 md:h-6 md:w-6 md:text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold md:text-sm">
                  Belum ada riwayat kredit
                </h3>
                <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
                  Kredit akan muncul di sini setelah Anda melakukan pembelian.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/dashboard/payment">
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

function CreditHistoryIcon({
  type,
  isSubscriptionCredit,
}: {
  type: string;
  isSubscriptionCredit: boolean;
}): React.ReactElement {
  if (isSubscriptionCredit) {
    return <Crown className="h-4 w-4 text-emerald-600" />;
  }

  switch (type) {
    case "PURCHASE":
      return <Coins className="h-4 w-4 text-primary" />;
    case "USAGE":
      return <Package className="h-4 w-4 text-red-500" />;
    case "BONUS":
    case "FREE_SIGNUP":
      return <Star className="h-4 w-4 text-amber-500" />;
    case "REFUND":
      return <ArrowRight className="h-4 w-4 rotate-180 text-primary" />;
    default:
      return <Coins className="h-4 w-4 text-muted-foreground" />;
  }
}

function TransactionAction({
  status,
  snapToken,
  midtransUrl,
  midtransId,
  midtransClientKey,
  isProduction,
}: {
  status: string;
  snapToken: string | null;
  midtransUrl: string | null;
  midtransId: string | null;
  midtransClientKey: string;
  isProduction: boolean;
}): React.ReactElement | null {
  if (status === "PENDING" && snapToken) {
    return (
      <ContinuePaymentButton
        snapToken={snapToken}
        midtransUrl={midtransUrl ?? ""}
        midtransClientKey={midtransClientKey}
        isProduction={isProduction}
        size="sm"
      />
    );
  }

  if (status === "FAILED" || status === "EXPIRED") {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/payment">Coba Lagi</Link>
      </Button>
    );
  }

  if (status === "PAID" && midtransId) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {midtransId}
      </span>
    );
  }

  return null;
}
