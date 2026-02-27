import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const inviteSchema = z.object({
    friendEmail: z.string().email(),
    packageId: z.string().optional(),
});

const acceptSchema = z.object({
    inviteCode: z.string().min(1),
});

// GET: List friend comparisons
export async function GET(): Promise<Response> {
    try {
        const user = await requireAuth();

        const friends = await prisma.friendComparison.findMany({
            where: {
                OR: [
                    { userId: user.id, isAccepted: true },
                    { friendId: user.id, isAccepted: true },
                ],
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                friend: { select: { id: true, name: true, avatar: true } },
            },
        });

        // Get comparison data for accepted friends
        const comparisons = await Promise.all(
            friends.map(async (f) => {
                const friendUserId = f.userId === user.id ? f.friendId : f.userId;
                const friendUser = f.userId === user.id ? f.friend : f.user;

                // Get latest attempts for comparison
                const [myAttempts, friendAttempts] = await Promise.all([
                    prisma.examAttempt.findMany({
                        where: { userId: user.id, status: "COMPLETED" },
                        select: { score: true, packageId: true, package: { select: { title: true } } },
                        orderBy: { finishedAt: "desc" },
                        take: 5,
                    }),
                    prisma.examAttempt.findMany({
                        where: { userId: friendUserId, status: "COMPLETED" },
                        select: { score: true, packageId: true, package: { select: { title: true } } },
                        orderBy: { finishedAt: "desc" },
                        take: 5,
                    }),
                ]);

                // Find common packages
                const myPackageIds = new Set(myAttempts.map((a) => a.packageId));
                const commonPackages = friendAttempts.filter((a) => myPackageIds.has(a.packageId));

                return {
                    friendId: friendUserId,
                    friend: friendUser,
                    myAvgScore: myAttempts.length > 0
                        ? Math.round(myAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / myAttempts.length * 100) / 100
                        : 0,
                    friendAvgScore: friendAttempts.length > 0
                        ? Math.round(friendAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / friendAttempts.length * 100) / 100
                        : 0,
                    commonPackages: commonPackages.length,
                    myTotalAttempts: myAttempts.length,
                    friendTotalAttempts: friendAttempts.length,
                };
            })
        );

        // Get pending invites
        const pendingInvites = await prisma.friendComparison.findMany({
            where: { friendId: user.id, isAccepted: false },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
        });

        return successResponse({ comparisons, pendingInvites });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Send friend comparison invite
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { friendEmail, packageId } = inviteSchema.parse(body);

        if (friendEmail === user.email) {
            return errorResponse("SELF_INVITE", "Tidak bisa mengundang diri sendiri", 400);
        }

        const friend = await prisma.user.findUnique({
            where: { email: friendEmail },
            select: { id: true, name: true },
        });

        if (!friend) {
            return errorResponse("USER_NOT_FOUND", "User dengan email tersebut tidak ditemukan", 404);
        }

        // Check existing
        const existing = await prisma.friendComparison.findFirst({
            where: {
                OR: [
                    { userId: user.id, friendId: friend.id },
                    { userId: friend.id, friendId: user.id },
                ],
            },
        });

        if (existing) {
            return errorResponse("ALREADY_EXISTS", "Undangan perbandingan sudah ada", 400);
        }

        const comparison = await prisma.friendComparison.create({
            data: {
                userId: user.id,
                friendId: friend.id,
                packageId: packageId ?? null,
            },
        });

        return successResponse(comparison, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT: Accept friend comparison invite
export async function PUT(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { inviteCode } = acceptSchema.parse(body);

        const invite = await prisma.friendComparison.findUnique({
            where: { inviteCode },
        });

        if (!invite || invite.friendId !== user.id) {
            return errorResponse("NOT_FOUND", "Undangan tidak ditemukan", 404);
        }

        const updated = await prisma.friendComparison.update({
            where: { id: invite.id },
            data: { isAccepted: true },
        });

        return successResponse(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
