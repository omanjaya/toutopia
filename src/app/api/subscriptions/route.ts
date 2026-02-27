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

// POST: Subscribe to a bundle
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { bundleId, plan } = subscribeSchema.parse(body);

        const bundle = await prisma.subscriptionBundle.findUnique({
            where: { id: bundleId },
        });

        if (!bundle || !bundle.isActive) {
            return errorResponse("NOT_FOUND", "Paket bundling tidak ditemukan", 404);
        }

        // Check existing active subscription
        const existingSub = await prisma.subscription.findFirst({
            where: { userId: user.id, bundleId, status: "ACTIVE" },
        });

        if (existingSub) {
            return errorResponse("ALREADY_SUBSCRIBED", "Kamu sudah berlangganan paket ini", 400);
        }

        // Calculate amount and end date
        let amount: number;
        let durationMonths: number;

        switch (plan) {
            case "MONTHLY":
                amount = bundle.monthlyPrice;
                durationMonths = 1;
                break;
            case "QUARTERLY":
                amount = bundle.quarterlyPrice ?? bundle.monthlyPrice * 3;
                durationMonths = 3;
                break;
            case "YEARLY":
                amount = bundle.yearlyPrice ?? bundle.monthlyPrice * 12;
                durationMonths = 12;
                break;
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        const subscription = await prisma.subscription.create({
            data: {
                userId: user.id,
                bundleId,
                plan,
                amount,
                startDate,
                endDate,
            },
            include: {
                bundle: { select: { name: true } },
            },
        });

        return successResponse(subscription, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
