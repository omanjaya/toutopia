import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { reviewQuestionSchema } from "@/shared/lib/validators/question.validators";
import { createNotification } from "@/shared/lib/notifications";
import { logAudit } from "@/shared/lib/audit-log";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = reviewQuestionSchema.parse(body);

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Soal");

    const question = await prisma.question.update({
      where: { id },
      data: {
        status: data.status,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNote: data.reviewNote ?? null,
      },
    });

    logAudit({
      userId: user.id,
      action: "REVIEW",
      entity: "Question",
      entityId: id,
      oldData: { status: existing.status },
      newData: { status: data.status, reviewNote: data.reviewNote },
    });

    // Notify the question creator
    if (existing.createdById) {
      const statusLabel = data.status === "APPROVED" ? "disetujui" : "ditolak";
      await createNotification({
        userId: existing.createdById,
        type: "QUESTION_STATUS",
        title: `Soal ${statusLabel}`,
        message: data.reviewNote
          ? `Soal Anda telah ${statusLabel}. Catatan: ${data.reviewNote}`
          : `Soal Anda telah ${statusLabel}.`,
        data: { questionId: id, status: data.status },
      });
    }

    return successResponse(question);
  } catch (error) {
    return handleApiError(error);
  }
}
