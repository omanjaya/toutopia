import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { applyPromoSchema } from "@/shared/lib/validators/promo.validators";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await requireAuth();
    const rl = checkRateLimit(`promo-apply:${user.id}`, { maxRequests: 10, windowMs: 60000 });
    if (!rl.success) {
      return errorResponse("RATE_LIMITED", "Terlalu banyak permintaan", 429);
    }

    const body = await request.json();
    const { code, amount } = applyPromoSchema.parse(body);

    // Validate-only: do NOT create PromoUsage here.
    // PromoUsage is created atomically in /api/payment/create to prevent
    // abandoned checkouts from consuming promo codes.
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return errorResponse("INVALID_CODE", "Kode promo tidak valid", 404);
    }

    const now = new Date();

    if (promo.validFrom && now < promo.validFrom) {
      return errorResponse("NOT_STARTED", "Kode promo belum berlaku", 400);
    }

    if (promo.validUntil && now > promo.validUntil) {
      return errorResponse("EXPIRED", "Kode promo sudah kedaluwarsa", 400);
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return errorResponse("MAX_USES", "Kode promo sudah habis", 400);
    }

    // Check if user already used this promo (has a confirmed PromoUsage with orderId)
    const existing = await prisma.promoUsage.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: promo.id,
          userId: user.id,
        },
      },
    });

    if (existing && existing.orderId) {
      return errorResponse("ALREADY_USED", "Kamu sudah menggunakan kode promo ini", 400);
    }

    if (amount < promo.minPurchase) {
      return errorResponse(
        "MIN_PURCHASE",
        "Minimum pembelian tidak terpenuhi",
        400
      );
    }

    let discount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discount = Math.round(amount * (promo.discountValue / 100));
    } else {
      discount = Math.min(promo.discountValue, amount);
    }

    const finalAmount = Math.max(0, amount - discount);

    return successResponse({
      promoCode: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discount,
      originalAmount: amount,
      finalAmount,
      description: promo.description,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
