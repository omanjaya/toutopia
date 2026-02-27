import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

// GET: List upcoming & active live events
export async function GET(request: NextRequest): Promise<Response> {
    try {
        await requireAuth();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") ?? "upcoming";
        const page = parseInt(searchParams.get("page") ?? "1", 10);
        const limit = parseInt(searchParams.get("limit") ?? "10", 10);

        const now = new Date();
        let whereClause;

        if (status === "upcoming") {
            whereClause = {
                status: { in: ["SCHEDULED" as const, "LIVE" as const] },
                scheduledAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            };
        } else if (status === "past") {
            whereClause = { status: "ENDED" as const };
        } else {
            whereClause = {};
        }

        const [events, total] = await Promise.all([
            prisma.liveEvent.findMany({
                where: whereClause,
                include: {
                    package: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            totalQuestions: true,
                            durationMinutes: true,
                            category: { select: { name: true, slug: true } },
                        },
                    },
                    _count: { select: { registrations: true } },
                },
                orderBy: { scheduledAt: status === "past" ? "desc" : "asc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.liveEvent.count({ where: whereClause }),
        ]);

        return successResponse(events, { page, limit, total });
    } catch (error) {
        return handleApiError(error);
    }
}
