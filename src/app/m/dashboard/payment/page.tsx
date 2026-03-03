import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { getMidtransClientKey } from "@/shared/lib/midtrans";
import { MobilePaymentCheckout } from "./mobile-payment-checkout";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembayaran",
};

export default async function MobilePaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ packageId?: string; plan?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/m/login");

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
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <MobilePaymentCheckout
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
        />
      </Suspense>
    </>
  );
}
