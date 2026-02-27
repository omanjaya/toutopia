import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const createEventSchema = z.object({
    packageId: z.string().min(1),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    scheduledAt: z.string().datetime(),
    endAt: z.string().datetime().optional(),
    maxParticipants: z.number().int().positive().optional(),
});

const updateEventSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    scheduledAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    status: z.enum(["SCHEDULED", "LIVE", "ENDED", "CANCELLED"]).optional(),
    maxParticipants: z.number().int().positive().optional(),
});

// GET: List all events (admin)
export async function GET(request: NextRequest): Promise<Response> {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") ?? "1", 10);
        const limit = parseInt(searchParams.get("limit") ?? "10", 10);

        const [events, total] = await Promise.all([
            prisma.liveEvent.findMany({
                include: {
                    package: { select: { title: true, slug: true } },
                    _count: { select: { registrations: true } },
                },
                orderBy: { scheduledAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.liveEvent.count(),
        ]);

        return successResponse(events, { page, limit, total });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Create live event
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAdmin();
        const body = await request.json();
        const data = createEventSchema.parse(body);

        const pkg = await prisma.examPackage.findUnique({ where: { id: data.packageId } });
        if (!pkg) {
            return errorResponse("NOT_FOUND", "Paket ujian tidak ditemukan", 404);
        }

        const event = await prisma.liveEvent.create({
            data: {
                packageId: data.packageId,
                title: data.title,
                description: data.description,
                scheduledAt: new Date(data.scheduledAt),
                endAt: data.endAt ? new Date(data.endAt) : null,
                maxParticipants: data.maxParticipants,
                createdById: user.id,
            },
        });

        return successResponse(event, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT: Update live event
export async function PUT(request: NextRequest): Promise<Response> {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return errorResponse("MISSING_ID", "Event ID required", 400);

        const body = await request.json();
        const data = updateEventSchema.parse(body);

        const event = await prisma.liveEvent.update({
            where: { id },
            data: {
                ...data,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                endAt: data.endAt ? new Date(data.endAt) : undefined,
            },
        });

        return successResponse(event);
    } catch (error) {
        return handleApiError(error);
    }
}
