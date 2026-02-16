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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const rl = checkRateLimit(`payment:${user.id}`, rateLimits.payment);
    if (!rl.success) throw new RateLimitError();

    const body = await request.json();
    const data = createPaymentSchema.parse(body);

    let amount = 0;
    let description = "";
    let packageId: string | null = null;

    if (data.type === "SINGLE_PACKAGE") {
      if (!data.packageId) {
        return errorResponse("INVALID", "Package ID diperlukan", 400);
      }

      const pkg = await prisma.examPackage.findUnique({
        where: { id: data.packageId, status: "PUBLISHED" },
      });

      if (!pkg) {
        return errorResponse("NOT_FOUND", "Paket tidak ditemukan", 404);
      }

      if (pkg.isFree) {
        return errorResponse("INVALID", "Paket ini gratis", 400);
      }

      // Check duplicate purchase
      const existingPurchase = await prisma.transaction.findFirst({
        where: {
          userId: user.id,
          packageId: pkg.id,
          status: "PAID",
        },
      });

      if (existingPurchase) {
        return errorResponse(
          "DUPLICATE",
          "Anda sudah membeli paket ini",
          409
        );
      }

      amount = pkg.discountPrice ?? pkg.price;
      description = `Try Out: ${pkg.title}`;
      packageId = pkg.id;
    } else if (data.type === "CREDIT_BUNDLE") {
      const bundle =
        data.bundleSize === "10"
          ? PRICING.CREDIT_BUNDLE_10
          : PRICING.CREDIT_BUNDLE_5;
      amount = bundle.price;
      description = bundle.label;
    } else if (data.type === "SUBSCRIPTION") {
      const plan =
        data.subscriptionPlan === "YEARLY"
          ? PRICING.SUBSCRIPTION_YEARLY
          : PRICING.SUBSCRIPTION_MONTHLY;
      amount = plan.price;
      description = plan.label;
    }

    if (amount <= 0) {
      return errorResponse("INVALID", "Jumlah pembayaran tidak valid", 400);
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        packageId,
        amount,
        status: "PENDING",
        metadata: {
          type: data.type,
          bundleSize: data.bundleSize ?? null,
          subscriptionPlan: data.subscriptionPlan ?? null,
          description,
        },
      },
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
        gross_amount: amount,
      },
      item_details: [
        {
          id: data.type,
          price: amount,
          quantity: 1,
          name: description,
        },
      ],
      customer_details: {
        first_name: userDetails?.name ?? "User",
        email: userDetails?.email ?? "",
        phone: userDetails?.phone ?? "",
      },
    };

    const snapResponse = await snap.createTransaction(midtransParam);

    // Update transaction with Midtrans data
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        midtransId: transaction.id,
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
