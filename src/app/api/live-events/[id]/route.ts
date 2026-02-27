import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

// POST: Register for a live event
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    try {
        const user = await requireAuth();
        const { id } = await params;

        const event = await prisma.liveEvent.findUnique({
            where: { id },
            include: { _count: { select: { registrations: true } } },
        });

        if (!event) {
            return errorResponse("NOT_FOUND", "Event tidak ditemukan", 404);
        }

        if (event.status === "ENDED" || event.status === "CANCELLED") {
            return errorResponse("EVENT_ENDED", "Event sudah berakhir", 400);
        }

        if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
            return errorResponse("EVENT_FULL", "Event sudah penuh", 400);
        }

        // Check already registered
        const existing = await prisma.liveEventRegistration.findUnique({
            where: { eventId_userId: { eventId: id, userId: user.id } },
        });

        if (existing) {
            return errorResponse("ALREADY_REGISTERED", "Kamu sudah terdaftar", 400);
        }

        const registration = await prisma.liveEventRegistration.create({
            data: { eventId: id, userId: user.id },
        });

        return successResponse(registration, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

// GET: Get live event details with realtime leaderboard
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    try {
        const user = await requireAuth();
        const { id } = await params;

        const event = await prisma.liveEvent.findUnique({
            where: { id },
            include: {
                package: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        totalQuestions: true,
                        durationMinutes: true,
                        passingScore: true,
                        category: { select: { name: true } },
                    },
                },
                registrations: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                    },
                },
                _count: { select: { registrations: true } },
            },
        });

        if (!event) {
            return errorResponse("NOT_FOUND", "Event tidak ditemukan", 404);
        }

        const isRegistered = event.registrations.some((r) => r.userId === user.id);

        // Get live leaderboard from completed attempts during this event
        const leaderboard = await prisma.examAttempt.findMany({
            where: {
                packageId: event.package.id,
                status: "COMPLETED",
                startedAt: { gte: new Date(event.scheduledAt.getTime() - 30 * 60 * 1000) },
                userId: { in: event.registrations.map((r) => r.userId) },
            },
            select: {
                userId: true,
                score: true,
                finishedAt: true,
                user: { select: { name: true, avatar: true } },
            },
            orderBy: { score: "desc" },
            take: 50,
        });

        return successResponse({
            ...event,
            isRegistered,
            leaderboard: leaderboard.map((entry, index) => ({
                rank: index + 1,
                userId: entry.userId,
                name: entry.user.name,
                avatar: entry.user.avatar,
                score: entry.score,
                finishedAt: entry.finishedAt?.toISOString() ?? null,
            })),
        });
    } catch (error) {
        return handleApiError(error);
    }
}
