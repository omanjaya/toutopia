import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createNotification } from "@/shared/lib/notifications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireAuth();
    const { attemptId } = await params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        package: {
          include: {
            sections: {
              include: {
                questions: {
                  include: {
                    question: {
                      include: {
                        options: { where: { isCorrect: true } },
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

    if (!attempt || attempt.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Sesi ujian tidak ditemukan", 404);
    }

    if (attempt.status !== "IN_PROGRESS") {
      return errorResponse(
        "ALREADY_SUBMITTED",
        "Ujian sudah disubmit sebelumnya",
        400
      );
    }

    // Grade all answers
    const allQuestions = attempt.package.sections.flatMap((s) =>
      s.questions.map((sq) => sq.question)
    );

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnanswered = 0;

    const answerUpdates: Promise<unknown>[] = [];

    for (const question of allQuestions) {
      const answer = attempt.answers.find(
        (a) => a.questionId === question.id
      );

      if (!answer || (!answer.selectedOptionId && answer.selectedOptions.length === 0 && answer.numericAnswer === null)) {
        totalUnanswered++;
        continue;
      }

      let isCorrect = false;
      const correctOptionIds = question.options.map((o) => o.id);

      if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
        isCorrect = answer.selectedOptionId
          ? correctOptionIds.includes(answer.selectedOptionId)
          : false;
      } else if (question.type === "MULTIPLE_CHOICE") {
        const selected = new Set(answer.selectedOptions);
        const correct = new Set(correctOptionIds);
        isCorrect =
          selected.size === correct.size &&
          [...selected].every((id) => correct.has(id));
      }

      if (isCorrect) {
        totalCorrect++;
      } else {
        totalIncorrect++;
      }

      if (answer) {
        answerUpdates.push(
          prisma.examAnswer.update({
            where: { id: answer.id },
            data: { isCorrect },
          })
        );
      }
    }

    await Promise.all(answerUpdates);

    const total = allQuestions.length;
    const score = total > 0 ? (totalCorrect / total) * 1000 : 0;

    const updated = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        score,
        totalCorrect,
        totalIncorrect,
        totalUnanswered,
      },
    });

    // Update leaderboard — keep best score per user per package
    await prisma.leaderboardEntry.upsert({
      where: {
        packageId_userId: {
          packageId: attempt.packageId,
          userId: user.id,
        },
      },
      update: score > 0 ? {
        score,
        attemptId,
      } : {},
      create: {
        packageId: attempt.packageId,
        userId: user.id,
        attemptId,
        score,
      },
    });

    // Send notification
    await createNotification({
      userId: user.id,
      type: "SCORE_UPDATE",
      title: "Hasil Ujian Tersedia",
      message: `Skor Anda: ${Math.round(score)}/1000 pada ${attempt.package.title}`,
      data: { attemptId, score },
    });

    return successResponse({
      attemptId: updated.id,
      score: updated.score,
      totalCorrect,
      totalIncorrect,
      totalUnanswered,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
