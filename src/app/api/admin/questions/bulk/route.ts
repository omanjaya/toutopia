import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const bulkActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "DELETE"]),
  questionIds: z.array(z.string().min(1)).min(1),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const { action, questionIds, reason } = bulkActionSchema.parse(body);

    // Verify all questions exist and are not already hard-deleted
    const existingQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds }, status: { not: "DELETED" } },
      select: { id: true },
    });

    if (existingQuestions.length !== questionIds.length) {
      const foundIds = new Set(existingQuestions.map((q) => q.id));
      const missingIds = questionIds.filter((id) => !foundIds.has(id));
      return errorResponse(
        "QUESTIONS_NOT_FOUND",
        `Soal berikut tidak ditemukan: ${missingIds.join(", ")}`,
        400
      );
    }

    let affected = 0;

    if (action === "APPROVE") {
      const result = await prisma.question.updateMany({
        where: { id: { in: questionIds } },
        data: {
          status: "APPROVED",
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNote: null,
        },
      });
      affected = result.count;
    } else if (action === "REJECT") {
      const result = await prisma.question.updateMany({
        where: { id: { in: questionIds } },
        data: {
          status: "REJECTED",
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNote: reason ?? null,
        },
      });
      affected = result.count;
    } else if (action === "DELETE") {
      // Determine which questions are in use (linked to exam sections)
      const usedLinks = await prisma.examSectionQuestion.findMany({
        where: { questionId: { in: questionIds } },
        select: { questionId: true },
      });

      const usedQuestionIds = new Set(usedLinks.map((l) => l.questionId));
      const unusedQuestionIds = questionIds.filter(
        (id) => !usedQuestionIds.has(id)
      );
      const softDeleteIds = questionIds.filter((id) => usedQuestionIds.has(id));

      await prisma.$transaction(async (tx) => {
        // Soft-delete questions that are still referenced in exam sections
        if (softDeleteIds.length > 0) {
          await tx.question.updateMany({
            where: { id: { in: softDeleteIds } },
            data: { status: "DELETED", deletedAt: new Date() },
          });
        }

        // Hard-delete questions not used in any section
        if (unusedQuestionIds.length > 0) {
          await tx.question.deleteMany({
            where: { id: { in: unusedQuestionIds } },
          });
        }
      });

      affected = questionIds.length;
    }

    return successResponse({ affected });
  } catch (error) {
    return handleApiError(error);
  }
}
