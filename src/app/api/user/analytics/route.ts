import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();

    // Get all completed attempts with package/category info
    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      orderBy: { finishedAt: "asc" },
      select: {
        id: true,
        score: true,
        totalCorrect: true,
        totalIncorrect: true,
        totalUnanswered: true,
        startedAt: true,
        finishedAt: true,
        package: {
          select: {
            id: true,
            title: true,
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Score trend (last 20 attempts)
    const scoreTrend = attempts.slice(-20).map((a) => ({
      date: a.finishedAt?.toISOString() ?? a.startedAt.toISOString(),
      score: Math.round(a.score ?? 0),
      packageTitle: a.package.title,
    }));

    // Category performance (radar chart data)
    const categoryMap: Record<
      string,
      { name: string; totalScore: number; count: number }
    > = {};

    for (const a of attempts) {
      const catId = a.package.category.id;
      const catName = a.package.category.name;
      if (!categoryMap[catId]) {
        categoryMap[catId] = { name: catName, totalScore: 0, count: 0 };
      }
      categoryMap[catId].totalScore += a.score ?? 0;
      categoryMap[catId].count++;
    }

    const categoryPerformance = Object.values(categoryMap).map((c) => ({
      category: c.name,
      avgScore: Math.round(c.totalScore / c.count),
      attempts: c.count,
    }));

    // Weakest topics — analyze incorrect answers
    const recentAttemptIds = attempts.slice(-10).map((a) => a.id);

    const incorrectAnswers = await prisma.examAnswer.findMany({
      where: {
        attemptId: { in: recentAttemptIds },
        isCorrect: false,
      },
      select: {
        question: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
                subject: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const topicErrors: Record<
      string,
      { topicName: string; subjectName: string; errorCount: number }
    > = {};

    for (const ans of incorrectAnswers) {
      const topicId = ans.question.topic.id;
      if (!topicErrors[topicId]) {
        topicErrors[topicId] = {
          topicName: ans.question.topic.name,
          subjectName: ans.question.topic.subject.name,
          errorCount: 0,
        };
      }
      topicErrors[topicId].errorCount++;
    }

    const weakestTopics = Object.values(topicErrors)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 10);

    // Summary stats
    const totalAttempts = attempts.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) /
              totalAttempts
          )
        : 0;
    const bestScore =
      totalAttempts > 0
        ? Math.round(Math.max(...attempts.map((a) => a.score ?? 0)))
        : 0;
    const totalCorrect = attempts.reduce(
      (sum, a) => sum + (a.totalCorrect ?? 0),
      0
    );
    const totalIncorrect = attempts.reduce(
      (sum, a) => sum + (a.totalIncorrect ?? 0),
      0
    );

    return successResponse({
      summary: {
        totalAttempts,
        avgScore,
        bestScore,
        totalCorrect,
        totalIncorrect,
        accuracy:
          totalCorrect + totalIncorrect > 0
            ? Math.round(
                (totalCorrect / (totalCorrect + totalIncorrect)) * 100
              )
            : 0,
      },
      scoreTrend,
      categoryPerformance,
      weakestTopics,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
