import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { verifySignature } from "@/shared/lib/midtrans";
import { PRICING } from "@/shared/lib/validators/payment.validators";
import { createNotification } from "@/shared/lib/notifications";
import { sendEmailAsync } from "@/infrastructure/email/email.service";
import { paymentSuccessEmailHtml } from "@/infrastructure/email/templates/payment-success";
import { checkRateLimit } from "@/shared/lib/rate-limit";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

interface TransactionMetadata {
  type?: string;
  bundleSize?: string | null;
  subscriptionPlan?: string | null;
  description?: string;
  promoCode?: string | null;
  promoCodeId?: string | null;
  promoDiscount?: number;
}

const validTypes = ["SINGLE_PACKAGE", "CREDIT_BUNDLE", "SUBSCRIPTION"] as const;

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

const subscriptionPlanMap: Record<string, string> = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
    const rl = checkRateLimit(`webhook:${ip}`, { maxRequests: 100, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ status: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id: midtransTransactionId,
    } = body;

    console.log(`[WEBHOOK] Received: order=${order_id} status=${transaction_status} fraud=${fraud_status}`);

    // Verify signature
    if (
      !verifySignature(order_id, status_code, gross_amount, signature_key)
    ) {
      console.error(`[WEBHOOK] Invalid signature for order ${order_id}`);
      return NextResponse.json({ status: "error", reason: "invalid_signature" });
    }

    // Handle fraud challenge status
    if (fraud_status === "challenge") {
      console.warn(`[WEBHOOK] Fraud challenge for order ${order_id}, needs manual review`);
      return NextResponse.json({ status: "challenge", message: "Manual review required" });
    }

    const mappedMethod = paymentMethodMap[payment_type] ?? null;

    // Wrap all processing in a serializable transaction for idempotency
    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Fetch transaction with lock inside serializable transaction
      const transaction = await tx.transaction.findUnique({
        where: { id: order_id },
      });

      if (!transaction) {
        console.error(`[WEBHOOK] Transaction not found: ${order_id}`);
        return { status: "error" as const, reason: "not_found" };
      }

      // Validate amount matches expected (handle decimal strings from Midtrans)
      const webhookAmount = Math.round(parseFloat(gross_amount));
      if (webhookAmount !== transaction.amount) {
        console.error(`[WEBHOOK] Amount mismatch: expected ${transaction.amount}, got ${webhookAmount} for ${order_id}`);
        return { status: "error" as const, reason: "amount_mismatch" };
      }

      // Handle pending status
      if (transaction_status === "pending") {
        // Don't overwrite if already in a terminal state
        if (
          transaction.status === "PAID" ||
          transaction.status === "FAILED" ||
          transaction.status === "EXPIRED" ||
          transaction.status === "REFUNDED"
        ) {
          return { status: "already_processed" as const };
        }

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            ...(mappedMethod ? { paymentMethod: mappedMethod as never } : {}),
            ...(midtransTransactionId ? { midtransId: String(midtransTransactionId) } : {}),
          },
        });
        return { status: "ok" as const };
      }

      // Idempotency: skip if already processed
      if (transaction.status === "PAID" || transaction.status === "REFUNDED") {
        return { status: "already_processed" as const };
      }

      // Handle successful payment
      if (
        transaction_status === "capture" ||
        transaction_status === "settlement"
      ) {
        if (fraud_status === "accept" || !fraud_status) {
          const metadata = (transaction.metadata ?? {}) as TransactionMetadata;
          const type = metadata.type;

          // Validate metadata type
          if (!type || !validTypes.includes(type as typeof validTypes[number])) {
            console.error(`[WEBHOOK] Invalid metadata type "${type}" for order ${order_id}`);
            return { status: "error" as const, reason: "invalid_metadata_type" };
          }

          console.log(`[WEBHOOK] Processing: order=${order_id} type=${type} amount=${transaction.amount}`);

          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "PAID",
              paymentMethod: mappedMethod as never,
              paidAt: new Date(),
              ...(midtransTransactionId ? { midtransId: String(midtransTransactionId) } : {}),
            },
          });

          if (type === "SINGLE_PACKAGE" && transaction.packageId) {
            // Grant 1 credit + direct access to the purchased package
            await tx.userCredit.upsert({
              where: { userId: transaction.userId },
              update: { balance: { increment: 1 } },
              create: { userId: transaction.userId, balance: 1 },
            });

            await tx.creditHistory.create({
              data: {
                userId: transaction.userId,
                amount: 1,
                type: "PURCHASE",
                description: `Pembelian: ${metadata.description ?? "Paket"}`,
                referenceId: transaction.id,
              },
            });

            // Create UserPackageAccess for direct package access
            await tx.userPackageAccess.upsert({
              where: {
                userId_packageId: {
                  userId: transaction.userId,
                  packageId: transaction.packageId,
                },
              },
              update: {},
              create: {
                userId: transaction.userId,
                packageId: transaction.packageId,
                grantedBy: "PAYMENT",
                reason: `Pembelian langsung: ${metadata.description ?? "Paket"}`,
              },
            });

            console.log(`[WEBHOOK] Complete: order=${order_id} credits=1 status=PAID`);
          } else if (type === "CREDIT_BUNDLE") {
            const bundleSize = metadata.bundleSize;
            const credits =
              bundleSize === "10"
                ? PRICING.CREDIT_BUNDLE_10.credits
                : PRICING.CREDIT_BUNDLE_5.credits;

            await tx.userCredit.upsert({
              where: { userId: transaction.userId },
              update: { balance: { increment: credits } },
              create: { userId: transaction.userId, balance: credits },
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

            console.log(`[WEBHOOK] Complete: order=${order_id} credits=${credits} status=PAID`);
          } else if (type === "SUBSCRIPTION") {
            const subPlan = metadata.subscriptionPlan;
            const subCredits = 999;

            await tx.userCredit.upsert({
              where: { userId: transaction.userId },
              update: { balance: { increment: subCredits } },
              create: { userId: transaction.userId, balance: subCredits },
            });

            await tx.creditHistory.create({
              data: {
                userId: transaction.userId,
                amount: subCredits,
                type: "PURCHASE",
                description: metadata.description ?? "Langganan",
                referenceId: transaction.id,
              },
            });

            // Create proper Subscription record with expiry dates
            const startDate = new Date();
            const endDate = new Date();
            if (subPlan === "YEARLY") {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else if (subPlan === "QUARTERLY") {
              endDate.setMonth(endDate.getMonth() + 3);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }

            const plan = subscriptionPlanMap[subPlan ?? ""] ?? "MONTHLY";

            // Find an active subscription bundle, or skip if none exists
            const bundle = await tx.subscriptionBundle.findFirst({
              where: { isActive: true },
            });

            if (bundle) {
              await tx.subscription.create({
                data: {
                  userId: transaction.userId,
                  bundleId: bundle.id,
                  plan: plan as never,
                  amount: transaction.amount,
                  startDate,
                  endDate,
                  midtransId: midtransTransactionId ? String(midtransTransactionId) : undefined,
                },
              });

              // Grant access to all packages in this bundle
              const bundlePackages = await tx.examPackage.findMany({
                where: { bundleId: bundle.id, status: "PUBLISHED" },
                select: { id: true },
              });

              if (bundlePackages.length > 0) {
                await tx.userPackageAccess.createMany({
                  data: bundlePackages.map((pkg: { id: string }) => ({
                    userId: transaction.userId,
                    packageId: pkg.id,
                    grantedBy: "SUBSCRIPTION",
                    expiresAt: endDate,
                  })),
                  skipDuplicates: true,
                });
              }
            }

            console.log(`[WEBHOOK] Complete: order=${order_id} credits=${subCredits} status=PAID`);
          }

          // Return transaction data for post-processing (notification + email)
          return {
            status: "ok" as const,
            _notify: true,
            _userId: transaction.userId,
            _transactionId: transaction.id,
            _grossAmount: gross_amount,
            _metadata: metadata,
          };
        }
      } else if (
        transaction_status === "deny" ||
        transaction_status === "cancel" ||
        transaction_status === "failure"
      ) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "FAILED" },
        });
      } else if (transaction_status === "expire") {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "EXPIRED" },
        });
      } else if (transaction_status === "refund" || transaction_status === "partial_refund") {
        const refundAmount = body.refund_amount
          ? Math.round(parseFloat(body.refund_amount as string))
          : null;

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: transaction_status === "partial_refund" ? "PAID" : "REFUNDED",
            ...(refundAmount != null ? { refundedAmount: refundAmount } : {}),
          },
        });

        console.log(
          `[WEBHOOK] ${transaction_status} for ${order_id}: refundAmount=${refundAmount}`
        );
      }

      return { status: "ok" as const };
    }, { isolationLevel: "Serializable" });

    // Post-transaction side effects (notifications and email)
    // These run outside the DB transaction to avoid holding locks
    if ("_notify" in result && result._notify) {
      await createNotification({
        userId: result._userId,
        type: "PAYMENT_SUCCESS",
        title: "Pembayaran Berhasil",
        message: `Pembayaran sebesar Rp ${Math.round(parseFloat(result._grossAmount)).toLocaleString("id-ID")} berhasil diproses.`,
        data: { transactionId: result._transactionId },
      });

      const paymentUser = await prisma.user.findUnique({
        where: { id: result._userId },
        select: { email: true, name: true },
      });
      if (paymentUser?.email) {
        try {
          await sendEmailAsync({
            to: paymentUser.email,
            subject: "Pembayaran Berhasil — Toutopia",
            html: paymentSuccessEmailHtml({
              name: paymentUser.name ?? "Pengguna",
              packageTitle: result._metadata.description ?? "Paket",
              amount: Math.round(parseFloat(result._grossAmount)),
              transactionId: result._transactionId,
            }),
          });
        } catch (emailError) {
          console.error(`[WEBHOOK] Email send failed for ${order_id}:`, emailError instanceof Error ? emailError.message : "Unknown");
        }
      }
    }

    return NextResponse.json({ status: result.status, ...(("reason" in result) ? { reason: result.reason } : {}), ...(("message" in result) ? { message: result.message } : {}) });
  } catch (error) {
    console.error("[WEBHOOK] Payment webhook error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ status: "error", reason: "internal_error" });
  }
}
