import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { PaymentCheckout } from "./payment-checkout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembayaran",
};

export default async function PaymentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const credit = await prisma.userCredit.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pembayaran</h2>
        <p className="text-muted-foreground">
          Saldo kredit: <span className="font-semibold">{credit?.balance ?? 0}</span> kredit
        </p>
      </div>

      <Suspense>
        <PaymentCheckout currentBalance={credit?.balance ?? 0} />
      </Suspense>
    </div>
  );
}
