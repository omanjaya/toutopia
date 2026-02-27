import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
): Promise<Response> {
  try {
    const user = await requireAuth();
    const { attemptId } = await params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true, packageId: true, status: true },
    });

    if (!attempt || attempt.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Tidak ditemukan", 404);
    }

    if (attempt.status !== "COMPLETED") {
      return errorResponse("NOT_COMPLETED", "Ujian belum selesai", 400);
    }

    // Get average scores from all completed attempts for this package
    const avgResult = await prisma.examAttempt.aggregate({
      where: { packageId: attempt.packageId, status: "COMPLETED" },
      _avg: { score: true },
      _count: true,
      _max: { score: true },
    });

    // Get user's answers grouped by section
    const userAnswers = await prisma.examAnswer.findMany({
      where: { attemptId },
      select: {
        isCorrect: true,
        question: {
          select: {
            sectionItems: {
              select: {
                section: {
                  select: {
                    id: true,
                    title: true,
                    subject: { select: { name: true } },
                    totalQuestions: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    // Aggregate by section
    const sectionMap = new Map<
      string,
      { title: string; subject: string; userCorrect: number; total: number }
    >();
    for (const answer of userAnswers) {
      const section = answer.question.sectionItems[0]?.section;
      if (!section) continue;
      if (!sectionMap.has(section.id)) {
        sectionMap.set(section.id, {
          title: section.title,
          subject: section.subject.name,
          userCorrect: 0,
          total: section.totalQuestions,
        });
      }
      const s = sectionMap.get(section.id)!;
      if (answer.isCorrect) s.userCorrect++;
    }

    // Get all other users' answers for the same package sections for comparison
    const allAnswers = await prisma.examAnswer.findMany({
      where: {
        attempt: { packageId: attempt.packageId, status: "COMPLETED" },
        isCorrect: { not: null },
      },
      select: {
        isCorrect: true,
        question: {
          select: {
            sectionItems: {
              select: { sectionId: true },
              take: 1,
            },
          },
        },
      },
      take: 10000,
    });

    const sectionAvgMap = new Map<string, { correct: number; total: number }>();
    for (const answer of allAnswers) {
      const sectionId = answer.question.sectionItems[0]?.sectionId;
      if (!sectionId) continue;
      if (!sectionAvgMap.has(sectionId)) {
        sectionAvgMap.set(sectionId, { correct: 0, total: 0 });
      }
      const s = sectionAvgMap.get(sectionId)!;
      s.total++;
      if (answer.isCorrect) s.correct++;
    }

    const sectionComparison = Array.from(sectionMap.entries()).map(([id, data]) => {
      const avg = sectionAvgMap.get(id);
      const avgPct = avg && avg.total > 0 ? Math.round((avg.correct / avg.total) * 100) : 0;
      const userPct = data.total > 0 ? Math.round((data.userCorrect / data.total) * 100) : 0;
      return {
        title: data.title,
        subject: data.subject,
        userScore: userPct,
        avgScore: avgPct,
        diff: userPct - avgPct,
      };
    });

    return successResponse({
      avgScore: Math.round(avgResult._avg.score ?? 0),
      maxScore: Math.round(avgResult._max.score ?? 0),
      totalParticipants: avgResult._count,
      sectionComparison,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
