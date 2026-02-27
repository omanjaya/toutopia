import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireAuth();
    const { attemptId } = await params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
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
                      include: {
                        options: { orderBy: { order: "asc" } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt || attempt.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Hasil ujian tidak ditemukan", 404);
    }

    if (attempt.status === "IN_PROGRESS") {
      return errorResponse("NOT_FINISHED", "Ujian belum selesai", 400);
    }

    // Build sections with answers and correct answers
    const sections = attempt.package.sections.map((section) => {
      const questions = section.questions.map((sq) => {
        const answer = attempt.answers.find(
          (a) => a.questionId === sq.questionId
        );
        const correctOptions = sq.question.options.filter((o) => o.isCorrect);

        return {
          id: sq.question.id,
          content: sq.question.content,
          type: sq.question.type,
          explanation: sq.question.explanation,
          videoUrl: sq.question.videoUrl,
          imageUrl: sq.question.imageUrl,
          options: sq.question.options.map((o) => ({
            id: o.id,
            label: o.label,
            content: o.content,
            imageUrl: o.imageUrl,
            isCorrect: o.isCorrect,
          })),
          selectedOptionId: answer?.selectedOptionId ?? null,
          selectedOptions: answer?.selectedOptions ?? [],
          numericAnswer: answer?.numericAnswer ?? null,
          isCorrect: answer?.isCorrect ?? null,
          timeSpentSeconds: answer?.timeSpentSeconds ?? 0,
          correctOptionIds: correctOptions.map((o) => o.id),
        };
      });

      const sectionCorrect = questions.filter((q) => q.isCorrect === true).length;
      const sectionTotal = questions.length;

      return {
        id: section.id,
        title: section.title,
        subjectName: section.subject.name,
        questions,
        correct: sectionCorrect,
        total: sectionTotal,
      };
    });

    return successResponse({
      id: attempt.id,
      status: attempt.status,
      packageTitle: attempt.package.title,
      score: attempt.score,
      totalCorrect: attempt.totalCorrect,
      totalIncorrect: attempt.totalIncorrect,
      totalUnanswered: attempt.totalUnanswered,
      percentile: attempt.percentile,
      violations: attempt.violations,
      startedAt: attempt.startedAt.toISOString(),
      finishedAt: attempt.finishedAt?.toISOString() ?? null,
      passingScore: attempt.package.passingScore,
      sections,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
