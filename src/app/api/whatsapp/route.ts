import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const waSubSchema = z.object({
    phoneNumber: z.string().min(10).max(15),
    remindSchedule: z.boolean().default(true),
    remindResult: z.boolean().default(true),
    remindEvent: z.boolean().default(true),
});

const updateSchema = z.object({
    isActive: z.boolean().optional(),
    remindSchedule: z.boolean().optional(),
    remindResult: z.boolean().optional(),
    remindEvent: z.boolean().optional(),
});

// GET: Get user's WA subscription
export async function GET(): Promise<Response> {
    try {
        const user = await requireAuth();

        const subscription = await prisma.whatsappSubscription.findUnique({
            where: { userId: user.id },
        });

        return successResponse(subscription);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Create WA subscription
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const data = waSubSchema.parse(body);

        const existing = await prisma.whatsappSubscription.findUnique({
            where: { userId: user.id },
        });

        if (existing) {
            return errorResponse("ALREADY_EXISTS", "Sudah berlangganan notifikasi WhatsApp", 400);
        }

        // Normalize phone number
        let phone = data.phoneNumber.replace(/[^0-9]/g, "");
        if (phone.startsWith("0")) {
            phone = "62" + phone.substring(1);
        }

        const subscription = await prisma.whatsappSubscription.create({
            data: {
                userId: user.id,
                phoneNumber: phone,
                remindSchedule: data.remindSchedule,
                remindResult: data.remindResult,
                remindEvent: data.remindEvent,
            },
        });

        return successResponse(subscription, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT: Update WA subscription
export async function PUT(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const data = updateSchema.parse(body);

        const subscription = await prisma.whatsappSubscription.findUnique({
            where: { userId: user.id },
        });

        if (!subscription) {
            return errorResponse("NOT_FOUND", "Belum berlangganan notifikasi WhatsApp", 404);
        }

        const updated = await prisma.whatsappSubscription.update({
            where: { userId: user.id },
            data,
        });

        return successResponse(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE: Remove WA subscription
export async function DELETE(): Promise<Response> {
    try {
        const user = await requireAuth();

        await prisma.whatsappSubscription.deleteMany({
            where: { userId: user.id },
        });

        return successResponse({ deleted: true });
    } catch (error) {
        return handleApiError(error);
    }
}
