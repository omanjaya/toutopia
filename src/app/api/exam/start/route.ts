import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError, RateLimitError } from "@/shared/lib/api-error";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";

const startExamSchema = z.object({
  packageId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const rl = checkRateLimit(`exam-start:${user.id}`, rateLimits.payment);
    if (!rl.success) throw new RateLimitError();

    const body = await request.json();
    const { packageId } = startExamSchema.parse(body);

    const pkg = await prisma.examPackage.findUnique({
      where: { id: packageId },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
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
    });

    if (!pkg || pkg.status !== "PUBLISHED") {
      return errorResponse("NOT_FOUND", "Paket ujian tidak ditemukan", 404);
    }

    // Check existing in-progress attempt
    const existing = await prisma.examAttempt.findFirst({
      where: {
        userId: user.id,
        packageId,
        status: "IN_PROGRESS",
      },
    });

    if (existing) {
      return errorResponse(
        "ALREADY_IN_PROGRESS",
        "Anda sudah memiliki sesi ujian yang sedang berjalan",
        409
      );
    }

    // Check max attempts
    const attemptCount = await prisma.examAttempt.count({
      where: { userId: user.id, packageId },
    });

    if (attemptCount >= pkg.maxAttempts) {
      return errorResponse(
        "MAX_ATTEMPTS_REACHED",
        `Anda sudah mencapai batas percobaan (${pkg.maxAttempts}x)`,
        403
      );
    }

    // Check credits for paid packages
    if (!pkg.isFree) {
      const credit = await prisma.userCredit.findUnique({
        where: { userId: user.id },
      });

      if (!credit || credit.balance < 1) {
        return errorResponse(
          "INSUFFICIENT_CREDITS",
          "Kredit tidak cukup untuk memulai ujian",
          402
        );
      }
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + pkg.durationMinutes * 60_000);

    const attempt = await prisma.$transaction(async (tx) => {
      // Deduct credit for paid packages
      if (!pkg.isFree) {
        await tx.userCredit.update({
          where: { userId: user.id },
          data: { balance: { decrement: 1 } },
        });

        await tx.creditHistory.create({
          data: {
            userId: user.id,
            amount: -1,
            type: "USAGE",
            description: `Try Out: ${pkg.title}`,
          },
        });
      }

      // Create attempt
      const created = await tx.examAttempt.create({
        data: {
          userId: user.id,
          packageId,
          serverStartedAt: now,
          serverDeadline: deadline,
        },
      });

      // Pre-create answer slots for all questions
      const answerData = pkg.sections.flatMap((section) =>
        section.questions.map((sq) => ({
          attemptId: created.id,
          questionId: sq.questionId,
        }))
      );

      if (answerData.length > 0) {
        await tx.examAnswer.createMany({ data: answerData });
      }

      return created;
    });

    return successResponse({ attemptId: attempt.id });
  } catch (error) {
    return handleApiError(error);
  }
}
