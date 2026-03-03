import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const metadata: Metadata = { title: "Pembayaran Berhasil" };
export const dynamic = "force-dynamic";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface TransactionMetadata {
  type?: string;
  description?: string;
  bundleSize?: string;
  subscriptionPlan?: string;
  promoCode?: string | null;
  promoDiscount?: number;
}

function getSubscriptionEndDate(plan: string): Date {
  const now = new Date();
  switch (plan) {
    case "MONTHLY":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case "QUARTERLY":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    case "YEARLY":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

function getSubscriptionLabel(plan: string): string {
  switch (plan) {
    case "MONTHLY":
      return "Bulanan";
    case "QUARTERLY":
      return "Triwulan";
    case "YEARLY":
      return "Tahunan";
    default:
      return plan;
  }
}

function getCreditCount(meta: TransactionMetadata): number {
  if (meta.bundleSize === "10") return 10;
  if (meta.bundleSize === "5") return 5;
  return 0;
}

interface PageProps {
  searchParams: Promise<{ transactionId?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const transactionId = params.transactionId;

  if (!transactionId) {
    redirect("/dashboard/payment/history");
  }

  const userId = (session.user as { id: string }).id;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: {
      id: true,
      userId: true,
      amount: true,
      status: true,
      paymentMethod: true,
      paidAt: true,
      createdAt: true,
      metadata: true,
      package: {
        select: { title: true },
      },
    },
  });

  // Verify ownership and existence
  if (!transaction || transaction.userId !== userId) {
    redirect("/dashboard/payment/history");
  }

  const meta = (transaction.metadata ?? {}) as TransactionMetadata;
  const paymentDate = transaction.paidAt ?? transaction.createdAt;

  // Determine what the user received
  let benefitText = "";
  let benefitSubText = "";

  switch (meta.type) {
    case "SINGLE_PACKAGE": {
      const packageTitle = transaction.package?.title ?? "paket try out";
      benefitText = `Anda mendapatkan akses ke ${packageTitle}`;
      break;
    }
    case "CREDIT_BUNDLE": {
      const credits = getCreditCount(meta);
      benefitText = `${credits} kredit telah ditambahkan ke akun Anda`;
      break;
    }
    case "SUBSCRIPTION": {
      const plan = meta.subscriptionPlan ?? "MONTHLY";
      const label = getSubscriptionLabel(plan);
      const endDate = getSubscriptionEndDate(plan);
      benefitText = `Langganan ${label} aktif`;
      benefitSubText = `Berlaku hingga ${format(endDate, "d MMMM yyyy", { locale: idLocale })}`;
      break;
    }
    default:
      benefitText = "Pembayaran berhasil diproses";
  }

  const paymentMethodLabel = transaction.paymentMethod
    ? transaction.paymentMethod.replace(/_/g, " ")
    : "Midtrans";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className={cardCls}>
        <div className="flex flex-col items-center px-6 pt-10 pb-8 text-center">
          <div className="rounded-full bg-emerald-100 p-4">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            Pembayaran Berhasil!
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {meta.description ?? "Transaksi Anda telah berhasil diproses."}
          </p>
        </div>

        {/* Transaction details */}
        <div className="border-t px-6 py-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Pembayaran</span>
              <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span className="font-medium capitalize">{paymentMethodLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium">
                {format(paymentDate, "d MMMM yyyy, HH:mm", { locale: idLocale })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ID Transaksi</span>
              <span className="font-mono text-xs text-muted-foreground">
                {transaction.id.slice(0, 16)}...
              </span>
            </div>
          </div>
        </div>

        {/* Benefit received */}
        <div className="border-t px-6 py-5">
          <div className="rounded-xl bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-800">
              {benefitText}
            </p>
            {benefitSubText && (
              <p className="mt-0.5 text-xs text-emerald-600">
                {benefitSubText}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" asChild>
              <Link href="/dashboard/tryout">
                Mulai Try Out
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/dashboard/payment/history">
                Lihat Riwayat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
