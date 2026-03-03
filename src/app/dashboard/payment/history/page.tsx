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
import { formatCurrency } from "@/shared/lib/utils";
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

export default async function PaymentHistoryPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const midtransClientKey = getMidtransClientKey();

  const credit = await prisma.userCredit.findUnique({
    where: { userId: session.user.id },
  });

  const activeSubscription: SubscriptionWithBundle | null =
    await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        endDate: { gt: new Date() },
      },
      include: {
        bundle: { select: { name: true } },
      },
      orderBy: { endDate: "desc" },
    });

  const transactions: TransactionWithRelations[] =
    await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        package: { select: { title: true } },
        ebook: { select: { title: true } },
      },
    });

  const creditHistory: CreditHistoryRow[] =
    await prisma.creditHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

  const pendingTransactions = transactions.filter(
    (t: TransactionWithRelations) => t.status === "PENDING" && t.snapToken
  );

  return (
    <div className="space-y-6">
      {/* Header + Credit Balance / Subscription Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Pending Payments Section */}
      {pendingTransactions.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">
              Menunggu Pembayaran
            </h3>
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-100 text-amber-700"
            >
              {pendingTransactions.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {pendingTransactions.map((t: TransactionWithRelations) => {
              const meta = t.metadata as Record<string, string> | null;
              const description =
                t.package?.title ?? t.ebook?.title ?? meta?.description ?? "-";
              const typeInfo = getTransactionTypeLabel(meta, !!t.ebookId);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg bg-white/80 px-4 py-3 ring-1 ring-amber-200"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {description}
                      </p>
                      <Badge
                        variant={typeInfo.variant}
                        className="shrink-0 text-[10px]"
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

      {/* Credit History */}
      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold tracking-tight">
            Riwayat Kredit
          </h3>
        </div>
        <div className="p-6">
          {creditHistory.length > 0 ? (
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
                          {new Date(h.createdAt).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}
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
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">
                Belum ada riwayat kredit
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Kredit akan muncul di sini setelah Anda melakukan pembelian.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/dashboard/payment">Beli Kredit</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className={cardCls}>
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold tracking-tight">
            Riwayat Transaksi
          </h3>
        </div>
        <div className="p-6">
          {transactions.length > 0 ? (
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
                    const typeInfo = getTransactionTypeLabel(
                      meta,
                      !!t.ebookId
                    );

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
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">Belum ada transaksi</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Transaksi pembelian kredit dan paket akan muncul di sini.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/dashboard/payment">Mulai Belanja</Link>
              </Button>
            </div>
          )}
        </div>
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
