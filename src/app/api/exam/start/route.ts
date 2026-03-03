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

    const now = new Date();
    const deadline = new Date(now.getTime() + pkg.durationMinutes * 60_000);

    const attempt = await prisma.$transaction(async (tx) => {
      // Race-condition-safe check for existing in-progress attempt (inside transaction)
      const existing = await tx.examAttempt.findFirst({
        where: { userId: user.id, packageId, status: "IN_PROGRESS" },
      });
      if (existing) {
        throw Object.assign(new Error("ALREADY_IN_PROGRESS"), { code: "ALREADY_IN_PROGRESS" });
      }

      // Check max attempts inside transaction
      const attemptCount = await tx.examAttempt.count({
        where: { userId: user.id, packageId },
      });
      if (attemptCount >= pkg.maxAttempts) {
        throw Object.assign(new Error("MAX_ATTEMPTS_REACHED"), { code: "MAX_ATTEMPTS_REACHED" });
      }

      // Check direct access for paid packages
      let hasDirectAccess = false;
      if (!pkg.isFree) {
        const directAccess = await tx.userPackageAccess.findUnique({
          where: { userId_packageId: { userId: user.id, packageId } },
        });
        hasDirectAccess = !!directAccess &&
          (!directAccess.expiresAt || directAccess.expiresAt > new Date());
      }

      // Track which credit bucket was used (if any) for the history record
      let creditSource: "FREE" | "BALANCE" | null = null;

      // Deduct credit for paid packages (skip if user has direct or subscription access)
      if (!pkg.isFree && !hasDirectAccess) {
        // Check if user has active subscription for this package's bundle
        let hasSubscriptionAccess = false;
        if (pkg.bundleId) {
          const activeSub = await tx.subscription.findFirst({
            where: {
              userId: user.id,
              bundleId: pkg.bundleId,
              status: "ACTIVE",
              endDate: { gt: new Date() },
            },
          });
          hasSubscriptionAccess = !!activeSub;
        }

        if (!hasSubscriptionAccess) {
          // Atomic credit deduction — no separate findUnique needed.
          // The updateMany WHERE clause acts as the balance check itself.
          const freeResult = await tx.userCredit.updateMany({
            where: { userId: user.id, freeCredits: { gte: 1 } },
            data: { freeCredits: { decrement: 1 } },
          });

          if (freeResult.count > 0) {
            creditSource = "FREE";
          } else {
            const balanceResult = await tx.userCredit.updateMany({
              where: { userId: user.id, balance: { gte: 1 } },
              data: { balance: { decrement: 1 } },
            });

            if (balanceResult.count > 0) {
              creditSource = "BALANCE";
            } else {
              throw Object.assign(new Error("INSUFFICIENT_CREDITS"), {
                code: "INSUFFICIENT_CREDITS",
              });
            }
          }
        }
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

      // Record credit usage after attempt creation so we can reference the attempt ID
      if (creditSource) {
        await tx.creditHistory.create({
          data: {
            userId: user.id,
            amount: -1,
            type: "USAGE",
            description: `Try Out: ${pkg.title} (${creditSource === "FREE" ? "kredit gratis" : "saldo"})`,
            referenceId: created.id,
          },
        });
      }

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
    const code = (error as { code?: string }).code;
    if (code === "ALREADY_IN_PROGRESS") {
      return errorResponse("ALREADY_IN_PROGRESS", "Anda sudah memiliki sesi ujian yang sedang berjalan", 409);
    }
    if (code === "MAX_ATTEMPTS_REACHED") {
      return errorResponse("MAX_ATTEMPTS_REACHED", "Anda sudah mencapai batas percobaan maksimum", 403);
    }
    if (
      code === "INSUFFICIENT_CREDITS" ||
      (error instanceof Error && error.message === "INSUFFICIENT_CREDITS")
    ) {
      return errorResponse(
        "INSUFFICIENT_CREDITS",
        "Kredit tidak cukup untuk memulai ujian. Silakan beli kredit terlebih dahulu.",
        402,
      );
    }
    return handleApiError(error);
  }
}
