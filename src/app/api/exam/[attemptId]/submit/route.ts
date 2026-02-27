import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createNotification } from "@/shared/lib/notifications";
import { sendEmailAsync } from "@/infrastructure/email/email.service";
import { checkAndAwardBadges } from "@/infrastructure/badge-service";
import { scoreResultEmailHtml } from "@/infrastructure/email/templates/score-result";

function gradeAnswer(
  question: { type: string; options: { id: string }[] },
  answer: { selectedOptionId: string | null; selectedOptions: string[]; numericAnswer: number | null } | undefined
): boolean | null {
  if (!answer || (!answer.selectedOptionId && answer.selectedOptions.length === 0 && answer.numericAnswer === null)) {
    return null; // unanswered
  }

  const correctOptionIds = question.options.map((o) => o.id);

  if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
    return answer.selectedOptionId ? correctOptionIds.includes(answer.selectedOptionId) : false;
  } else if (question.type === "MULTIPLE_CHOICE") {
    const selected = new Set(answer.selectedOptions);
    const correct = new Set(correctOptionIds);
    return selected.size === correct.size && [...selected].every((id) => correct.has(id));
  }
  return false;
}

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
                      select: {
                        id: true,
                        type: true,
                        createdById: true,
                        correctRate: true,
                        usageCount: true,
                        options: { where: { isCorrect: true }, select: { id: true } },
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

    const gradedAnswers: { answerId: string; isCorrect: boolean }[] = [];

    for (const question of allQuestions) {
      const answer = attempt.answers.find((a) => a.questionId === question.id);
      const result = gradeAnswer(question, answer);

      if (result === null) {
        totalUnanswered++;
        continue;
      }

      if (result) {
        totalCorrect++;
      } else {
        totalIncorrect++;
      }

      if (answer) {
        gradedAnswers.push({ answerId: answer.id, isCorrect: result });
      }
    }

    const total = allQuestions.length;
    const score = total > 0 ? (totalCorrect / total) * 1000 : 0;

    // Atomic status transition + grading + leaderboard + teacher earnings in one transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Atomically claim the attempt — prevents double submit
      const claimed = await tx.examAttempt.updateMany({
        where: { id: attemptId, status: "IN_PROGRESS" },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
          score,
          totalCorrect,
          totalIncorrect,
          totalUnanswered,
        },
      });

      if (claimed.count === 0) {
        throw new Error("ALREADY_SUBMITTED");
      }

      // Update graded answers
      for (const { answerId, isCorrect } of gradedAnswers) {
        await tx.examAnswer.update({
          where: { id: answerId },
          data: { isCorrect },
        });
      }

      // Update leaderboard — only update if new score is HIGHER
      const existing = await tx.leaderboardEntry.findUnique({
        where: {
          packageId_userId: {
            packageId: attempt.packageId,
            userId: user.id,
          },
        },
        select: { score: true },
      });

      if (!existing) {
        await tx.leaderboardEntry.create({
          data: {
            packageId: attempt.packageId,
            userId: user.id,
            attemptId,
            score,
          },
        });
      } else if (score > existing.score) {
        await tx.leaderboardEntry.update({
          where: {
            packageId_userId: {
              packageId: attempt.packageId,
              userId: user.id,
            },
          },
          data: { score, attemptId },
        });
      }

      // Teacher earnings — Rp 100 per question per attempt
      const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      const teacherQuestionCreators = new Set<string>();

      for (const question of allQuestions) {
        if (question.createdById) {
          teacherQuestionCreators.add(question.createdById);
        }
      }

      if (teacherQuestionCreators.size > 0) {
        const teacherProfiles = await tx.teacherProfile.findMany({
          where: { userId: { in: [...teacherQuestionCreators] } },
          select: { id: true, userId: true },
        });

        const profileMap = new Map(teacherProfiles.map((tp) => [tp.userId, tp.id]));

        for (const question of allQuestions) {
          const profileId = profileMap.get(question.createdById);
          if (!profileId) continue;

          await tx.teacherEarning.upsert({
            where: {
              teacherProfileId_questionId_period: {
                teacherProfileId: profileId,
                questionId: question.id,
                period,
              },
            },
            update: {
              attemptCount: { increment: 1 },
              amount: { increment: 100 },
            },
            create: {
              teacherProfileId: profileId,
              questionId: question.id,
              period,
              attemptCount: 1,
              amount: 100,
            },
          });
        }
      }

      return tx.examAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    });

    // Post-transaction side effects (non-critical, outside transaction)

    // Calculate percentile rank
    const [totalParticipants, lowerScoreCount] = await Promise.all([
      prisma.examAttempt.count({
        where: {
          packageId: attempt.packageId,
          status: "COMPLETED",
        },
      }),
      prisma.examAttempt.count({
        where: {
          packageId: attempt.packageId,
          status: "COMPLETED",
          score: { lt: score },
        },
      }),
    ]);

    const percentile =
      totalParticipants > 1
        ? (lowerScoreCount / (totalParticipants - 1)) * 100
        : 100;

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { percentile },
    });

    // Send notification
    await createNotification({
      userId: user.id,
      type: "SCORE_UPDATE",
      title: "Hasil Ujian Tersedia",
      message: `Skor Anda: ${Math.round(score)}/1000 pada ${attempt.package.title}`,
      data: { attemptId, score },
    });

    // Send score email (fire-and-forget)
    sendEmailAsync({
      to: user.email,
      subject: `Hasil Ujian: ${attempt.package.title}`,
      html: scoreResultEmailHtml({
        name: user.name ?? "Pengguna",
        packageTitle: attempt.package.title,
        score,
        attemptId,
      }),
    });

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
    });

    if (profile) {
      const lastActive = profile.lastActiveDate
        ? new Date(profile.lastActiveDate)
        : null;
      if (lastActive) lastActive.setHours(0, 0, 0, 0);

      const isToday = lastActive?.getTime() === today.getTime();

      if (!isToday) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = lastActive?.getTime() === yesterday.getTime();

        const newStreak = isYesterday ? profile.currentStreak + 1 : 1;

        await prisma.userProfile.update({
          where: { userId: user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, profile.longestStreak),
            lastActiveDate: today,
          },
        });
      }
    }

    // Update Question.correctRate (incremental, non-critical)
    const correctRateUpdates: Promise<unknown>[] = [];

    for (const question of allQuestions) {
      const answer = attempt.answers.find((a) => a.questionId === question.id);
      const result = gradeAnswer(question, answer);
      if (result === null) continue;

      const oldCount = question.usageCount;
      const oldRate = question.correctRate;
      const newCount = oldCount + 1;
      const newRate = (oldRate * oldCount + (result ? 1 : 0)) / newCount;

      correctRateUpdates.push(
        prisma.question.update({
          where: { id: question.id },
          data: { correctRate: newRate, usageCount: newCount },
        })
      );
    }

    await Promise.all(correctRateUpdates);

    // Check for new badges (fire and forget)
    checkAndAwardBadges(user.id).catch(() => {});

    return successResponse({
      attemptId: updated.id,
      score: updated.score,
      totalCorrect,
      totalIncorrect,
      totalUnanswered,
      total,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_SUBMITTED") {
      return errorResponse(
        "ALREADY_SUBMITTED",
        "Ujian sudah disubmit sebelumnya",
        400
      );
    }
    return handleApiError(error);
  }
}
