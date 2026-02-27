import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

// GET: Get adaptive recommendations based on weak topics
export async function GET(): Promise<Response> {
    try {
        const user = await requireAuth();

        // Get all user's answers with topic info
        const answers = await prisma.examAnswer.findMany({
            where: {
                attempt: { userId: user.id, status: "COMPLETED" },
            },
            select: {
                isCorrect: true,
                question: {
                    select: {
                        topicId: true,
                        topic: {
                            select: {
                                id: true,
                                name: true,
                                subject: {
                                    select: {
                                        name: true,
                                        subCategory: {
                                            select: {
                                                category: { select: { name: true } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Calculate per-topic accuracy
        const topicStats = new Map<string, {
            topicId: string;
            topicName: string;
            subjectName: string;
            categoryName: string;
            total: number;
            correct: number;
        }>();

        for (const answer of answers) {
            const topicId = answer.question.topicId;
            const existing = topicStats.get(topicId) ?? {
                topicId,
                topicName: answer.question.topic.name,
                subjectName: answer.question.topic.subject.name,
                categoryName: answer.question.topic.subject.subCategory.category.name,
                total: 0,
                correct: 0,
            };

            existing.total++;
            if (answer.isCorrect) existing.correct++;
            topicStats.set(topicId, existing);
        }

        // Sort by accuracy (ascending) to find weakest topics
        const weakTopics = Array.from(topicStats.values())
            .filter((t) => t.total >= 3) // Minimum 3 answers to be meaningful
            .map((t) => ({
                ...t,
                accuracy: Math.round((t.correct / t.total) * 100),
            }))
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5); // Top 5 weakest

        // Get recommended questions from weak topics (not yet answered)
        const answeredQuestionIds = answers.map((a) => a.question.topicId);
        const weakTopicIds = weakTopics.map((t) => t.topicId);

        const recommendedQuestions = weakTopicIds.length > 0
            ? await prisma.question.findMany({
                where: {
                    topicId: { in: weakTopicIds },
                    status: "APPROVED",
                },
                select: {
                    id: true,
                    content: true,
                    type: true,
                    difficulty: true,
                    topic: {
                        select: {
                            name: true,
                            subject: { select: { name: true } },
                        },
                    },
                },
                take: 20,
                orderBy: { usageCount: "asc" },
            })
            : [];

        // Get strong topics too for comparison
        const strongTopics = Array.from(topicStats.values())
            .filter((t) => t.total >= 3)
            .map((t) => ({
                ...t,
                accuracy: Math.round((t.correct / t.total) * 100),
            }))
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 5);

        return successResponse({
            weakTopics,
            strongTopics,
            recommendedQuestions: recommendedQuestions.map((q) => ({
                id: q.id,
                content: q.content.substring(0, 200),
                type: q.type,
                difficulty: q.difficulty,
                topic: q.topic.name,
                subject: q.topic.subject.name,
            })),
            totalAnswered: answers.length,
            totalTopicsAnalyzed: topicStats.size,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
