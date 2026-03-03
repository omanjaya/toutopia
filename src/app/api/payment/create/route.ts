import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError, RateLimitError } from "@/shared/lib/api-error";
import { snap } from "@/shared/lib/midtrans";
import {
  createPaymentSchema,
  PRICING,
} from "@/shared/lib/validators/payment.validators";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://toutopia.nouma.id";

async function validateAndApplyPromo(
  tx: PrismaTransactionClient,
  promoCode: string,
  userId: string,
  productAmount: number
): Promise<{ promoCodeId: string; discount: number }> {
  const promo = await tx.promoCode.findUnique({
    where: { code: promoCode.toUpperCase() },
  });

  if (!promo || !promo.isActive) {
    throw new Error("INVALID_PROMO");
  }

  const now = new Date();
  if (promo.validFrom && now < promo.validFrom) throw new Error("INVALID_PROMO");
  if (promo.validUntil && now > promo.validUntil) throw new Error("INVALID_PROMO");
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) throw new Error("INVALID_PROMO");
  if (productAmount < promo.minPurchase) throw new Error("INVALID_PROMO");

  // Check if user already used this promo (has confirmed usage with orderId)
  const existing = await tx.promoUsage.findUnique({
    where: {
      promoCodeId_userId: { promoCodeId: promo.id, userId },
    },
  });

  if (existing && existing.orderId) {
    throw new Error("PROMO_ALREADY_USED");
  }

  // Calculate discount against actual product price (server-side)
  let discount = 0;
  if (promo.discountType === "PERCENTAGE") {
    discount = Math.round(productAmount * (promo.discountValue / 100));
  } else {
    discount = Math.min(promo.discountValue, productAmount);
  }

  // Upsert PromoUsage (may exist from a previous abandoned attempt without orderId)
  if (existing) {
    await tx.promoUsage.update({
      where: { id: existing.id },
      data: { discount },
    });
  } else {
    await tx.promoUsage.create({
      data: { promoCodeId: promo.id, userId, discount },
    });
  }

  await tx.promoCode.update({
    where: { id: promo.id },
    data: { usedCount: { increment: 1 } },
  });

  return { promoCodeId: promo.id, discount };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const rl = checkRateLimit(`payment:${user.id}`, rateLimits.payment);
    if (!rl.success) throw new RateLimitError();

    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Input tidak valid", 400);
    }

    const data = parsed.data;

    let amount: number;
    let credits: number;
    let description: string;
    let packageId: string | null = null;

    switch (data.type) {
      case "SINGLE_PACKAGE": {
        const pkg = await prisma.examPackage.findUnique({
          where: { id: data.packageId, status: "PUBLISHED" },
        });

        if (!pkg) {
          return errorResponse("NOT_FOUND", "Paket tidak ditemukan", 404);
        }

        if (pkg.isFree) {
          return errorResponse("INVALID", "Paket ini gratis", 400);
        }

        // Check duplicate: PAID or PENDING transactions
        const existingPurchase = await prisma.transaction.findFirst({
          where: {
            userId: user.id,
            packageId: pkg.id,
            status: { in: ["PAID", "PENDING"] },
          },
        });

        if (existingPurchase) {
          if (existingPurchase.status === "PAID") {
            return errorResponse("DUPLICATE", "Anda sudah membeli paket ini", 409);
          }
          // Return existing pending transaction's snap token
          if (existingPurchase.snapToken) {
            return successResponse({
              transactionId: existingPurchase.id,
              snapToken: existingPurchase.snapToken,
              redirectUrl: existingPurchase.midtransUrl,
            });
          }
        }

        amount = pkg.discountPrice ?? pkg.price;
        description = `Try Out: ${pkg.title}`;
        packageId = pkg.id;
        credits = 1;
        break;
      }

      case "CREDIT_BUNDLE": {
        const bundle = data.bundleSize === "10" ? PRICING.CREDIT_BUNDLE_10 : PRICING.CREDIT_BUNDLE_5;
        amount = bundle.price;
        credits = bundle.credits;
        description = bundle.label;
        break;
      }

      case "SUBSCRIPTION": {
        // Check for existing active subscription
        const existingSub = await prisma.subscription.findFirst({
          where: {
            userId: user.id,
            status: "ACTIVE",
            endDate: { gt: new Date() },
          },
        });
        if (existingSub) {
          return errorResponse(
            "ACTIVE_SUBSCRIPTION_EXISTS",
            "Anda sudah memiliki langganan aktif. Tunggu hingga berakhir atau batalkan terlebih dahulu.",
            409
          );
        }

        const subKey = `SUBSCRIPTION_${data.subscriptionPlan}` as keyof typeof PRICING;
        const sub = PRICING[subKey];
        amount = sub.price;
        credits = 999;
        description = sub.label;
        break;
      }
    }

    if (amount <= 0) {
      return errorResponse("INVALID", "Jumlah pembayaran tidak valid", 400);
    }

    // Apply promo discount atomically if promoCode is provided
    // Promo is validated + PromoUsage created inside a transaction to prevent race conditions
    let promoDiscount = 0;
    let promoCodeId: string | null = null;

    if (data.promoCode) {
      try {
        const promoResult = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
          return validateAndApplyPromo(tx, data.promoCode!, user.id, amount);
        });
        promoDiscount = promoResult.discount;
        promoCodeId = promoResult.promoCodeId;
      } catch (err) {
        if (err instanceof Error && err.message === "PROMO_ALREADY_USED") {
          return errorResponse("PROMO_ALREADY_USED", "Kamu sudah menggunakan kode promo ini", 400);
        }
        if (err instanceof Error && err.message === "INVALID_PROMO") {
          return errorResponse("INVALID_PROMO", "Kode promo tidak valid atau sudah kedaluwarsa", 400);
        }
        throw err;
      }
    }

    const finalAmount = Math.max(0, amount - promoDiscount);

    // Build metadata based on the discriminated type
    const baseMetadata = {
      type: data.type,
      description,
      promoCode: data.promoCode ?? null,
      promoCodeId,
      promoDiscount,
    };

    const metadata = data.type === "CREDIT_BUNDLE"
      ? { ...baseMetadata, bundleSize: data.bundleSize }
      : data.type === "SUBSCRIPTION"
        ? { ...baseMetadata, subscriptionPlan: data.subscriptionPlan }
        : baseMetadata;

    // Handle zero-amount payment (100% promo): grant credits directly, skip Midtrans
    if (finalAmount === 0) {
      const transaction = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        const created = await tx.transaction.create({
          data: {
            userId: user.id,
            packageId,
            amount: 0,
            status: "PAID",
            paidAt: new Date(),
            metadata: {
              ...metadata,
              zeroAmountPromo: true,
            },
          },
        });

        await tx.userCredit.upsert({
          where: { userId: user.id },
          update: { balance: { increment: credits } },
          create: { userId: user.id, balance: credits },
        });

        await tx.creditHistory.create({
          data: {
            userId: user.id,
            amount: credits,
            type: "PURCHASE",
            description: `${description} (100% diskon)`,
            referenceId: created.id,
          },
        });

        // Create UserPackageAccess for SINGLE_PACKAGE
        if (data.type === "SINGLE_PACKAGE" && packageId) {
          await tx.userPackageAccess.upsert({
            where: { userId_packageId: { userId: user.id, packageId } },
            update: {},
            create: {
              userId: user.id,
              packageId,
              grantedBy: "PAYMENT",
              reason: `Pembelian langsung (promo 100%)`,
            },
          });
        }

        // Link PromoUsage to transaction
        if (promoCodeId) {
          await tx.promoUsage.update({
            where: { promoCodeId_userId: { promoCodeId, userId: user.id } },
            data: { orderId: created.id },
          });
        }

        return created;
      });

      return successResponse({
        transactionId: transaction.id,
        paid: true,
      });
    }

    // Create transaction record AND link PromoUsage atomically
    const transaction = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const created = await tx.transaction.create({
        data: {
          userId: user.id,
          packageId,
          amount: finalAmount,
          status: "PENDING",
          metadata,
        },
      });

      // Link PromoUsage inside the same transaction for atomicity
      if (promoCodeId) {
        await tx.promoUsage.update({
          where: {
            promoCodeId_userId: { promoCodeId, userId: user.id },
          },
          data: { orderId: created.id },
        });
      }

      return created;
    });

    // Get user details for Midtrans
    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, phone: true },
    });

    // Create Midtrans Snap transaction
    const midtransParam = {
      transaction_details: {
        order_id: transaction.id,
        gross_amount: finalAmount,
      },
      item_details: [
        {
          id: data.type,
          price: finalAmount,
          quantity: 1,
          name: description.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: userDetails?.name ?? "User",
        email: userDetails?.email ?? "",
        phone: userDetails?.phone ?? "",
      },
      callbacks: {
        finish: `${BASE_URL}/dashboard/payment/history`,
        error: `${BASE_URL}/dashboard/payment/history`,
        pending: `${BASE_URL}/dashboard/payment/history`,
      },
    };

    const snapResponse = await snap.createTransaction(midtransParam);

    // Update transaction with Midtrans snap data
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        snapToken: snapResponse.token,
        midtransUrl: snapResponse.redirect_url,
      },
    });

    return successResponse({
      transactionId: transaction.id,
      snapToken: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
