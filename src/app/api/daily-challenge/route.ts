import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

function getTodayDateOnly(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const answerSchema = z.object({
    selectedOptionId: z.string().optional(),
    numericAnswer: z.number().optional(),
    timeSpentSeconds: z.number().int().min(0).default(0),
});

// GET today's daily challenge
export async function GET(): Promise<Response> {
    try {
        const user = await requireAuth();
        const today = getTodayDateOnly();

        let challenge = await prisma.dailyChallenge.findUnique({
            where: { date: today },
            include: {
                question: {
                    include: {
                        options: { orderBy: { order: "asc" } },
                        topic: { include: { subject: { select: { name: true } } } },
                    },
                },
                attempts: {
                    where: { userId: user.id },
                    select: {
                        isCorrect: true,
                        selectedOptionId: true,
                        numericAnswer: true,
                        timeSpentSeconds: true,
                    },
                },
            },
        });

        if (!challenge) {
            // Auto-create today's challenge from random approved question
            const randomQuestion = await prisma.question.findFirst({
                where: { status: "APPROVED" },
                orderBy: { usageCount: "asc" },
            });

            if (!randomQuestion) {
                return errorResponse("NO_QUESTIONS", "Belum ada soal tersedia", 404);
            }

            challenge = await prisma.dailyChallenge.create({
                data: {
                    questionId: randomQuestion.id,
                    date: today,
                },
                include: {
                    question: {
                        include: {
                            options: { orderBy: { order: "asc" } },
                            topic: { include: { subject: { select: { name: true } } } },
                        },
                    },
                    attempts: {
                        where: { userId: user.id },
                        select: {
                            isCorrect: true,
                            selectedOptionId: true,
                            numericAnswer: true,
                            timeSpentSeconds: true,
                        },
                    },
                },
            });
        }

        const userAttempt = challenge.attempts[0] ?? null;
        const isAttempted = Boolean(userAttempt);

        // Don't send correct answers if not attempted yet
        const questionData = {
            id: challenge.question.id,
            content: challenge.question.content,
            type: challenge.question.type,
            imageUrl: challenge.question.imageUrl,
            topic: challenge.question.topic.subject.name + " - " + challenge.question.topic.name,
            options: challenge.question.options.map((o) => ({
                id: o.id,
                label: o.label,
                content: o.content,
                imageUrl: o.imageUrl,
                ...(isAttempted ? { isCorrect: o.isCorrect } : {}),
            })),
            ...(isAttempted ? { explanation: challenge.question.explanation } : {}),
        };

        // Get user streak info
        const profile = await prisma.userProfile.findUnique({
            where: { userId: user.id },
            select: { currentStreak: true, longestStreak: true },
        });

        return successResponse({
            id: challenge.id,
            date: challenge.date.toISOString(),
            question: questionData,
            isAttempted,
            userAttempt,
            streak: {
                current: profile?.currentStreak ?? 0,
                longest: profile?.longestStreak ?? 0,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Submit daily challenge answer
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const data = answerSchema.parse(body);
        const today = getTodayDateOnly();

        const challenge = await prisma.dailyChallenge.findUnique({
            where: { date: today },
            include: {
                question: { include: { options: true } },
            },
        });

        if (!challenge) {
            return errorResponse("NOT_FOUND", "Daily challenge belum tersedia", 404);
        }

        // Check already attempted
        const existing = await prisma.dailyChallengeAttempt.findUnique({
            where: {
                dailyChallengeId_userId: {
                    dailyChallengeId: challenge.id,
                    userId: user.id,
                },
            },
        });

        if (existing) {
            return errorResponse("ALREADY_ATTEMPTED", "Kamu sudah menjawab challenge hari ini", 400);
        }

        // Determine correctness
        let isCorrect = false;
        if (data.selectedOptionId) {
            const option = challenge.question.options.find((o) => o.id === data.selectedOptionId);
            isCorrect = option?.isCorrect ?? false;
        } else if (data.numericAnswer !== undefined) {
            const correctOption = challenge.question.options.find((o) => o.isCorrect);
            isCorrect = correctOption ? parseFloat(correctOption.content) === data.numericAnswer : false;
        }

        // Create attempt + update streak
        const attempt = await prisma.$transaction(async (tx) => {
            const newAttempt = await tx.dailyChallengeAttempt.create({
                data: {
                    dailyChallengeId: challenge.id,
                    userId: user.id,
                    selectedOptionId: data.selectedOptionId ?? null,
                    numericAnswer: data.numericAnswer ?? null,
                    isCorrect,
                    timeSpentSeconds: data.timeSpentSeconds,
                },
            });

            // Update streak
            const profile = await tx.userProfile.findUnique({
                where: { userId: user.id },
            });

            if (profile) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const isConsecutive = profile.lastActiveDate
                    ? profile.lastActiveDate.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10)
                    : false;

                const newStreak = isConsecutive ? profile.currentStreak + 1 : 1;
                const newLongest = Math.max(newStreak, profile.longestStreak);

                await tx.userProfile.update({
                    where: { userId: user.id },
                    data: {
                        currentStreak: newStreak,
                        longestStreak: newLongest,
                        lastActiveDate: today,
                    },
                });
            }

            return newAttempt;
        });

        return successResponse({
            isCorrect,
            attempt,
            explanation: challenge.question.explanation,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
