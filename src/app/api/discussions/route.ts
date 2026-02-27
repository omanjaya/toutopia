import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const createDiscussionSchema = z.object({
    questionId: z.string().min(1),
    content: z.string().min(1).max(2000),
    parentId: z.string().optional(),
});

export async function GET(request: NextRequest): Promise<Response> {
    try {
        await requireAuth();
        const { searchParams } = new URL(request.url);
        const questionId = searchParams.get("questionId");
        const page = parseInt(searchParams.get("page") ?? "1", 10);
        const limit = parseInt(searchParams.get("limit") ?? "20", 10);

        if (!questionId) {
            return successResponse([]);
        }

        const [discussions, total] = await Promise.all([
            prisma.discussion.findMany({
                where: { questionId, parentId: null },
                include: {
                    user: { select: { id: true, name: true, avatar: true } },
                    votes: { select: { userId: true, value: true } },
                    replies: {
                        include: {
                            user: { select: { id: true, name: true, avatar: true } },
                            votes: { select: { userId: true, value: true } },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                    _count: { select: { replies: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.discussion.count({ where: { questionId, parentId: null } }),
        ]);

        return successResponse(discussions, { page, limit, total });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const data = createDiscussionSchema.parse(body);

        const discussion = await prisma.discussion.create({
            data: {
                questionId: data.questionId,
                userId: user.id,
                content: data.content,
                parentId: data.parentId ?? null,
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
        });

        return successResponse(discussion, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
