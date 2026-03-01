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

export default async function MobilePaymentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/m/login");

  const credit = await prisma.userCredit.findUnique({
    where: { userId: session.user.id },
  });

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
        <MobilePaymentCheckout currentBalance={credit?.balance ?? 0} />
      </Suspense>
    </>
  );
}
