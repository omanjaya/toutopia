import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const syncSchema = z.object({
    items: z.array(
        z.object({
            attemptId: z.string().optional(),
            syncType: z.enum(["answer", "attempt_complete"]),
            data: z.record(z.string(), z.unknown()),
        })
    ),
});

// POST: Sync offline data
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { items } = syncSchema.parse(body);

        const results = [];

        for (const item of items) {
            const syncRecord = await prisma.offlineSync.create({
                data: {
                    userId: user.id,
                    attemptId: item.attemptId ?? null,
                    syncType: item.syncType,
                    data: item.data as Prisma.InputJsonValue,
                    isSynced: true,
                    syncedAt: new Date(),
                },
            });

            // Process each sync type
            if (item.syncType === "answer" && item.attemptId) {
                const answerData = item.data as {
                    questionId: string;
                    selectedOptionId?: string;
                    selectedOptions?: string[];
                    numericAnswer?: number;
                    timeSpentSeconds?: number;
                    isFlagged?: boolean;
                };

                if (answerData.questionId) {
                    await prisma.examAnswer.upsert({
                        where: {
                            attemptId_questionId: {
                                attemptId: item.attemptId,
                                questionId: answerData.questionId,
                            },
                        },
                        update: {
                            selectedOptionId: answerData.selectedOptionId ?? null,
                            selectedOptions: answerData.selectedOptions ?? [],
                            numericAnswer: answerData.numericAnswer ?? null,
                            timeSpentSeconds: answerData.timeSpentSeconds ?? 0,
                            isFlagged: answerData.isFlagged ?? false,
                        },
                        create: {
                            attemptId: item.attemptId,
                            questionId: answerData.questionId,
                            selectedOptionId: answerData.selectedOptionId ?? null,
                            selectedOptions: answerData.selectedOptions ?? [],
                            numericAnswer: answerData.numericAnswer ?? null,
                            timeSpentSeconds: answerData.timeSpentSeconds ?? 0,
                            isFlagged: answerData.isFlagged ?? false,
                        },
                    });
                }
            }

            results.push({ id: syncRecord.id, syncType: item.syncType, status: "synced" });
        }

        return successResponse({ synced: results.length, results });
    } catch (error) {
        return handleApiError(error);
    }
}

// GET: Get questions for offline caching
export async function GET(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);
        const attemptId = searchParams.get("attemptId");

        if (!attemptId) {
            return successResponse({ questions: [] });
        }

        // Get attempt with questions for offline caching
        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, userId: user.id },
            include: {
                package: {
                    include: {
                        sections: {
                            orderBy: { order: "asc" },
                            include: {
                                subject: { select: { name: true } },
                                questions: {
                                    orderBy: { order: "asc" },
                                    include: {
                                        question: {
                                            select: {
                                                id: true,
                                                content: true,
                                                type: true,
                                                imageUrl: true,
                                                options: {
                                                    select: {
                                                        id: true,
                                                        label: true,
                                                        content: true,
                                                        imageUrl: true,
                                                        order: true,
                                                    },
                                                    orderBy: { order: "asc" },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                answers: {
                    select: {
                        questionId: true,
                        selectedOptionId: true,
                        selectedOptions: true,
                        numericAnswer: true,
                        isFlagged: true,
                        timeSpentSeconds: true,
                    },
                },
            },
        });

        if (!attempt) {
            return successResponse({ questions: [] });
        }

        return successResponse({
            attemptId: attempt.id,
            packageTitle: attempt.package.title,
            serverDeadline: attempt.serverDeadline.toISOString(),
            sectionTimers: attempt.sectionTimers,
            sections: attempt.package.sections.map((s) => ({
                id: s.id,
                title: s.title,
                subjectName: s.subject.name,
                durationMinutes: s.durationMinutes,
                questions: s.questions.map((sq) => ({
                    ...sq.question,
                    existingAnswer: attempt.answers.find((a) => a.questionId === sq.question.id) ?? null,
                })),
            })),
        });
    } catch (error) {
        return handleApiError(error);
    }
}
