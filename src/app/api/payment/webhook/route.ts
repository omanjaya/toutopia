import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { verifySignature } from "@/shared/lib/midtrans";
import { PRICING } from "@/shared/lib/validators/payment.validators";
import { createNotification } from "@/shared/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    // Verify signature
    if (
      !verifySignature(order_id, status_code, gross_amount, signature_key)
    ) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: order_id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Idempotency: skip if already processed
    if (transaction.status === "PAID" || transaction.status === "REFUNDED") {
      return NextResponse.json({ status: "already_processed" });
    }

    // Map payment type to our enum
    const paymentMethodMap: Record<string, string> = {
      qris: "QRIS",
      bank_transfer: "BANK_TRANSFER",
      echannel: "BANK_TRANSFER",
      gopay: "EWALLET",
      shopeepay: "EWALLET",
      dana: "EWALLET",
      ovo: "EWALLET",
      credit_card: "CREDIT_CARD",
    };

    const mappedMethod = paymentMethodMap[payment_type] ?? null;

    // Determine new status
    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (fraud_status === "accept" || !fraud_status) {
        // Payment successful
        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "PAID",
              paymentMethod: mappedMethod as never,
              paidAt: new Date(),
            },
          });

          const metadata = transaction.metadata as Record<string, string> | null;
          const type = metadata?.type;

          if (type === "SINGLE_PACKAGE" && transaction.packageId) {
            // Grant 1 credit for the specific package
            await tx.userCredit.upsert({
              where: { userId: transaction.userId },
              update: { balance: { increment: 1 } },
              create: {
                userId: transaction.userId,
                balance: 1,
              },
            });

            await tx.creditHistory.create({
              data: {
                userId: transaction.userId,
                amount: 1,
                type: "PURCHASE",
                description: `Pembelian: ${metadata?.description ?? "Paket"}`,
                referenceId: transaction.id,
              },
            });
          } else if (type === "CREDIT_BUNDLE") {
            const bundleSize = metadata?.bundleSize;
            const credits =
              bundleSize === "10"
                ? PRICING.CREDIT_BUNDLE_10.credits
                : PRICING.CREDIT_BUNDLE_5.credits;

            await tx.userCredit.upsert({
              where: { userId: transaction.userId },
              update: { balance: { increment: credits } },
              create: {
                userId: transaction.userId,
                balance: credits,
              },
            });

            await tx.creditHistory.create({
              data: {
                userId: transaction.userId,
                amount: credits,
                type: "PURCHASE",
                description: `Bundle ${credits} kredit`,
                referenceId: transaction.id,
              },
            });
          } else if (type === "SUBSCRIPTION") {
            // For subscriptions, grant a large number of credits
            const subCredits = 999;
            await tx.userCredit.upsert({
              where: { userId: transaction.userId },
              update: { balance: { increment: subCredits } },
              create: {
                userId: transaction.userId,
                balance: subCredits,
              },
            });

            await tx.creditHistory.create({
              data: {
                userId: transaction.userId,
                amount: subCredits,
                type: "PURCHASE",
                description: metadata?.description ?? "Langganan",
                referenceId: transaction.id,
              },
            });
          }
        });

        // Notify user of successful payment
        await createNotification({
          userId: transaction.userId,
          type: "PAYMENT_SUCCESS",
          title: "Pembayaran Berhasil",
          message: `Pembayaran sebesar Rp ${parseInt(gross_amount).toLocaleString("id-ID")} berhasil diproses.`,
          data: { transactionId: transaction.id },
        });
      }
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "failure"
    ) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
    } else if (transaction_status === "expire") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "EXPIRED" },
      });
    } else if (transaction_status === "refund" || transaction_status === "partial_refund") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "REFUNDED" },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
