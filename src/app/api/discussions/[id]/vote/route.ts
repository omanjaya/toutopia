import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const voteSchema = z.object({
    value: z.union([z.literal(1), z.literal(-1)]),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    try {
        const user = await requireAuth();
        const { id } = await params;
        const body = await request.json();
        const { value } = voteSchema.parse(body);

        const discussion = await prisma.discussion.findUnique({ where: { id } });
        if (!discussion) {
            return errorResponse("NOT_FOUND", "Diskusi tidak ditemukan", 404);
        }

        const existing = await prisma.discussionVote.findUnique({
            where: { discussionId_userId: { discussionId: id, userId: user.id } },
        });

        if (existing) {
            if (existing.value === value) {
                // Remove vote (toggle off)
                await prisma.$transaction([
                    prisma.discussionVote.delete({ where: { id: existing.id } }),
                    prisma.discussion.update({
                        where: { id },
                        data: {
                            upvotes: value === 1 ? { decrement: 1 } : undefined,
                            downvotes: value === -1 ? { decrement: 1 } : undefined,
                        },
                    }),
                ]);
                return successResponse({ action: "removed" });
            } else {
                // Change vote
                await prisma.$transaction([
                    prisma.discussionVote.update({
                        where: { id: existing.id },
                        data: { value },
                    }),
                    prisma.discussion.update({
                        where: { id },
                        data: {
                            upvotes: value === 1 ? { increment: 1 } : { decrement: 1 },
                            downvotes: value === -1 ? { increment: 1 } : { decrement: 1 },
                        },
                    }),
                ]);
                return successResponse({ action: "changed", value });
            }
        }

        // New vote
        await prisma.$transaction([
            prisma.discussionVote.create({
                data: { discussionId: id, userId: user.id, value },
            }),
            prisma.discussion.update({
                where: { id },
                data: {
                    upvotes: value === 1 ? { increment: 1 } : undefined,
                    downvotes: value === -1 ? { increment: 1 } : undefined,
                },
            }),
        ]);

        return successResponse({ action: "voted", value });
    } catch (error) {
        return handleApiError(error);
    }
}
