import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; sectionId: string; questionId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id: packageId, sectionId, questionId } = await params;

    // Verify section belongs to this package
    const section = await prisma.examSection.findFirst({
      where: { id: sectionId, packageId },
      select: { id: true },
    });

    if (!section) return notFoundResponse("Seksi ujian");

    // Verify the link exists
    const link = await prisma.examSectionQuestion.findUnique({
      where: { sectionId_questionId: { sectionId, questionId } },
      select: { id: true, order: true },
    });

    if (!link) return notFoundResponse("Soal dalam seksi");

    const removedOrder = link.order;

    await prisma.$transaction(async (tx) => {
      // Delete the link record (does NOT delete the question itself)
      await tx.examSectionQuestion.delete({
        where: { sectionId_questionId: { sectionId, questionId } },
      });

      // Re-index order of remaining questions to close the gap
      const remaining = await tx.examSectionQuestion.findMany({
        where: { sectionId, order: { gt: removedOrder } },
        orderBy: { order: "asc" },
        select: { id: true },
      });

      for (let i = 0; i < remaining.length; i++) {
        await tx.examSectionQuestion.update({
          where: { id: remaining[i].id },
          data: { order: removedOrder + i },
        });
      }
    });

    return successResponse({ removed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
