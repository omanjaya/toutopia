import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { getMidtransClientKey } from "@/shared/lib/midtrans";
import { PRICING } from "@/shared/lib/validators/payment.validators";
import { PaymentCheckout } from "./payment-checkout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembayaran",
};

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ packageId?: string; plan?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { packageId } = await searchParams;

  const [credit, targetPackage] = await Promise.all([
    prisma.userCredit.findUnique({
      where: { userId: session.user.id },
    }),
    packageId
      ? prisma.examPackage.findUnique({
          where: { id: packageId, status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            price: true,
            discountPrice: true,
            isFree: true,
            totalQuestions: true,
            durationMinutes: true,
          },
        })
      : null,
  ]);

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const snapScriptUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <>
      <Script
        src={snapScriptUrl}
        data-client-key={getMidtransClientKey()}
        strategy="afterInteractive"
      />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pembayaran</h2>
          <p className="text-muted-foreground">
            Saldo kredit: <span className="font-semibold">{credit?.balance ?? 0}</span> kredit
          </p>
        </div>

        <Suspense>
          <PaymentCheckout
            currentBalance={credit?.balance ?? 0}
            targetPackage={
              targetPackage && !targetPackage.isFree
                ? {
                    id: targetPackage.id,
                    title: targetPackage.title,
                    price: targetPackage.discountPrice ?? targetPackage.price,
                    totalQuestions: targetPackage.totalQuestions,
                    durationMinutes: targetPackage.durationMinutes,
                  }
                : undefined
            }
            pricing={{
              creditBundles: [
                {
                  id: "bundle5",
                  name: PRICING.CREDIT_BUNDLE_5.label,
                  credits: PRICING.CREDIT_BUNDLE_5.credits,
                  price: PRICING.CREDIT_BUNDLE_5.price,
                },
                {
                  id: "bundle10",
                  name: PRICING.CREDIT_BUNDLE_10.label,
                  credits: PRICING.CREDIT_BUNDLE_10.credits,
                  price: PRICING.CREDIT_BUNDLE_10.price,
                  popular: true,
                },
              ],
              subscriptions: [
                {
                  id: "monthly",
                  name: PRICING.SUBSCRIPTION_MONTHLY.label,
                  price: PRICING.SUBSCRIPTION_MONTHLY.price,
                  duration: "30 hari",
                  plan: "MONTHLY",
                },
                {
                  id: "quarterly",
                  name: PRICING.SUBSCRIPTION_QUARTERLY.label,
                  price: PRICING.SUBSCRIPTION_QUARTERLY.price,
                  duration: "3 bulan",
                  plan: "QUARTERLY",
                },
                {
                  id: "yearly",
                  name: PRICING.SUBSCRIPTION_YEARLY.label,
                  price: PRICING.SUBSCRIPTION_YEARLY.price,
                  duration: "1 tahun",
                  plan: "YEARLY",
                },
              ],
            }}
          />
        </Suspense>
      </div>
    </>
  );
}
