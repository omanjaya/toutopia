import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id: packageId, sectionId } = await params;

    const body = await request.json();
    const { orderedIds } = reorderSchema.parse(body);

    // Verify section belongs to this package
    const section = await prisma.examSection.findFirst({
      where: { id: sectionId, packageId },
      select: { id: true },
    });

    if (!section) return notFoundResponse("Seksi ujian");

    // Fetch all current links for this section
    const existingLinks = await prisma.examSectionQuestion.findMany({
      where: { sectionId },
      select: { questionId: true },
    });

    const existingQuestionIds = new Set(existingLinks.map((l) => l.questionId));

    // Validate all provided IDs belong to this section
    const invalidIds = orderedIds.filter((id) => !existingQuestionIds.has(id));
    if (invalidIds.length > 0) {
      return errorResponse(
        "INVALID_QUESTION_IDS",
        `Soal berikut tidak ditemukan di seksi ini: ${invalidIds.join(", ")}`,
        400
      );
    }

    // Validate that all existing questions are accounted for in the new order
    if (orderedIds.length !== existingLinks.length) {
      return errorResponse(
        "INCOMPLETE_ORDER",
        `Urutan harus mencakup semua ${existingLinks.length} soal dalam seksi`,
        400
      );
    }

    // Update order for each question in a transaction
    await prisma.$transaction(
      orderedIds.map((questionId, idx) =>
        prisma.examSectionQuestion.update({
          where: { sectionId_questionId: { sectionId, questionId } },
          data: { order: idx },
        })
      )
    );

    return successResponse({ reordered: orderedIds.length });
  } catch (error) {
    return handleApiError(error);
  }
}
