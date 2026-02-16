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
                        options: {
                          orderBy: { order: "asc" },
                          select: {
                            id: true,
                            label: true,
                            content: true,
                            imageUrl: true,
                            order: true,
                          },
                        },
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
      return errorResponse("NOT_FOUND", "Sesi ujian tidak ditemukan", 404);
    }

    // Build sections with questions (without correct answers)
    const sections = attempt.package.sections.map((section) => ({
      id: section.id,
      title: section.title,
      subjectName: section.subject.name,
      durationMinutes: section.durationMinutes,
      questions: section.questions.map((sq) => {
        const answer = attempt.answers.find(
          (a) => a.questionId === sq.questionId
        );
        return {
          id: sq.question.id,
          content: sq.question.content,
          type: sq.question.type,
          imageUrl: sq.question.imageUrl,
          options: sq.question.options,
          selectedOptionId: answer?.selectedOptionId ?? null,
          selectedOptions: answer?.selectedOptions ?? [],
          numericAnswer: answer?.numericAnswer ?? null,
          isFlagged: answer?.isFlagged ?? false,
          timeSpentSeconds: answer?.timeSpentSeconds ?? 0,
        };
      }),
    }));

    return successResponse({
      id: attempt.id,
      status: attempt.status,
      packageTitle: attempt.package.title,
      isAntiCheat: attempt.package.isAntiCheat,
      serverDeadline: attempt.serverDeadline.toISOString(),
      violations: attempt.violations,
      sections,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
