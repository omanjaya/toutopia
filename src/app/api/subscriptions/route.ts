import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const subscribeSchema = z.object({
    bundleId: z.string().min(1),
    plan: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
});

// GET: List bundles & user subscriptions
export async function GET(): Promise<Response> {
    try {
        const user = await requireAuth();

        const [bundles, userSubs] = await Promise.all([
            prisma.subscriptionBundle.findMany({
                where: { isActive: true },
                include: {
                    packages: {
                        where: { status: "PUBLISHED" },
                        select: { id: true, title: true, slug: true, price: true },
                    },
                    _count: { select: { packages: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.subscription.findMany({
                where: { userId: user.id, status: "ACTIVE" },
                include: {
                    bundle: { select: { name: true, slug: true } },
                },
            }),
        ]);

        return successResponse({ bundles, userSubscriptions: userSubs });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Subscribe to a bundle (requires going through payment flow)
// This endpoint is disabled — subscriptions are created via the payment webhook
// after successful payment through /api/payment/create with type "SUBSCRIPTION"
export async function POST(_request: NextRequest): Promise<Response> {
    return errorResponse(
        "PAYMENT_REQUIRED",
        "Silakan berlangganan melalui halaman pembayaran",
        400
    );
}
