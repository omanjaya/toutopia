import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { applyPromoSchema } from "@/shared/lib/validators/promo.validators";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`promo-apply:${ip}`, { maxRequests: 10, windowMs: 60000 });
    if (!rl.success) {
      return errorResponse("RATE_LIMITED", "Terlalu banyak permintaan", 429);
    }

    const user = await requireAuth();
    const body = await request.json();
    const { code, amount } = applyPromoSchema.parse(body);

    // Validate and persist promo usage atomically to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      const promo = await tx.promoCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!promo || !promo.isActive) {
        throw new Error("INVALID_CODE");
      }

      const now = new Date();

      if (promo.validFrom && now < promo.validFrom) {
        throw new Error("NOT_STARTED");
      }

      if (promo.validUntil && now > promo.validUntil) {
        throw new Error("EXPIRED");
      }

      // Check max uses inside transaction to prevent race condition
      if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        throw new Error("MAX_USES");
      }

      const existing = await tx.promoUsage.findUnique({
        where: {
          promoCodeId_userId: {
            promoCodeId: promo.id,
            userId: user.id,
          },
        },
      });

      if (existing) {
        throw new Error("ALREADY_USED");
      }

      if (amount < promo.minPurchase) {
        throw new Error("MIN_PURCHASE");
      }

      let discount = 0;
      if (promo.discountType === "PERCENTAGE") {
        discount = Math.round(amount * (promo.discountValue / 100));
      } else {
        discount = Math.min(promo.discountValue, amount);
      }

      // Record usage and increment counter atomically
      await tx.promoUsage.create({
        data: {
          promoCodeId: promo.id,
          userId: user.id,
          discount,
          // orderId will be linked when payment is created
        },
      });

      await tx.promoCode.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      });

      return {
        promoId: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minPurchase: promo.minPurchase,
        discount,
        description: promo.description,
      };
    });

    const finalAmount = amount - result.discount;

    return successResponse({
      promoId: result.promoId,
      code: result.code,
      discountType: result.discountType,
      discountValue: result.discountValue,
      discount: result.discount,
      originalAmount: amount,
      finalAmount,
      description: result.description,
    });
  } catch (error) {
    // Handle domain errors thrown from inside the transaction
    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_CODE":
          return errorResponse("INVALID_CODE", "Kode promo tidak valid", 404);
        case "NOT_STARTED":
          return errorResponse("NOT_STARTED", "Kode promo belum berlaku", 400);
        case "EXPIRED":
          return errorResponse("EXPIRED", "Kode promo sudah kedaluwarsa", 400);
        case "MAX_USES":
          return errorResponse("MAX_USES", "Kode promo sudah habis", 400);
        case "ALREADY_USED":
          return errorResponse("ALREADY_USED", "Kamu sudah menggunakan kode promo ini", 400);
        case "MIN_PURCHASE":
          return errorResponse(
            "MIN_PURCHASE",
            `Minimum pembelian tidak terpenuhi`,
            400
          );
      }
    }
    return handleApiError(error);
  }
}
