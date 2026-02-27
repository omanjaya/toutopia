import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const linkChildSchema = z.object({
    childEmail: z.string().email(),
});

const acceptSchema = z.object({
    inviteCode: z.string().min(1),
});

// GET: Parent dashboard — list children & their progress
export async function GET(): Promise<Response> {
    try {
        const user = await requireAuth();

        const parentLinks = await prisma.parentChild.findMany({
            where: { parentId: user.id, isPending: false },
            include: {
                child: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        email: true,
                        profile: {
                            select: {
                                currentStreak: true,
                                longestStreak: true,
                                lastActiveDate: true,
                                targetExam: true,
                                school: true,
                            },
                        },
                    },
                },
            },
        });

        // Get children's progress data
        const childrenData = await Promise.all(
            parentLinks.map(async (link) => {
                const childId = link.child.id;

                // Recent attempts
                const recentAttempts = await prisma.examAttempt.findMany({
                    where: { userId: childId, status: "COMPLETED" },
                    select: {
                        score: true,
                        totalCorrect: true,
                        totalUnanswered: true,
                        finishedAt: true,
                        package: {
                            select: { title: true, totalQuestions: true, category: { select: { name: true } } },
                        },
                    },
                    orderBy: { finishedAt: "desc" },
                    take: 10,
                });

                // Badges
                const badges = await prisma.userBadge.findMany({
                    where: { userId: childId },
                    include: { badge: { select: { name: true, icon: true } } },
                    orderBy: { earnedAt: "desc" },
                    take: 5,
                });

                // Calculate stats
                const totalAttempts = recentAttempts.length;
                const avgScore = totalAttempts > 0
                    ? Math.round(recentAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / totalAttempts * 100) / 100
                    : 0;

                return {
                    child: link.child,
                    stats: {
                        totalAttempts,
                        avgScore,
                        lastActive: link.child.profile?.lastActiveDate?.toISOString() ?? null,
                    },
                    recentAttempts: recentAttempts.map((a) => ({
                        packageTitle: a.package.title,
                        category: a.package.category.name,
                        score: a.score,
                        totalCorrect: a.totalCorrect,
                        totalQuestions: a.package.totalQuestions,
                        finishedAt: a.finishedAt?.toISOString() ?? null,
                    })),
                    badges: badges.map((b) => ({
                        name: b.badge.name,
                        icon: b.badge.icon,
                        earnedAt: b.earnedAt.toISOString(),
                    })),
                };
            })
        );

        // Pending invites
        const pendingInvites = await prisma.parentChild.findMany({
            where: { parentId: user.id, isPending: true },
            include: { child: { select: { name: true, email: true } } },
        });

        return successResponse({
            children: childrenData,
            pendingInvites,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Link a child (send invite)
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { childEmail } = linkChildSchema.parse(body);

        const child = await prisma.user.findUnique({
            where: { email: childEmail },
            select: { id: true, role: true },
        });

        if (!child) {
            return errorResponse("USER_NOT_FOUND", "User dengan email tersebut tidak ditemukan", 404);
        }

        if (child.role !== "STUDENT") {
            return errorResponse("INVALID_ROLE", "Hanya bisa menautkan akun siswa", 400);
        }

        if (child.id === user.id) {
            return errorResponse("SELF_LINK", "Tidak bisa menautkan diri sendiri", 400);
        }

        const existing = await prisma.parentChild.findFirst({
            where: { parentId: user.id, childId: child.id },
        });

        if (existing) {
            return errorResponse("ALREADY_LINKED", "Anak sudah ditautkan", 400);
        }

        const link = await prisma.parentChild.create({
            data: {
                parentId: user.id,
                childId: child.id,
            },
        });

        return successResponse(link, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT: Accept parent link (by child)
export async function PUT(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { inviteCode } = acceptSchema.parse(body);

        const link = await prisma.parentChild.findUnique({
            where: { inviteCode },
        });

        if (!link || link.childId !== user.id) {
            return errorResponse("NOT_FOUND", "Undangan tidak ditemukan", 404);
        }

        const updated = await prisma.parentChild.update({
            where: { id: link.id },
            data: { isPending: false },
        });

        return successResponse(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
