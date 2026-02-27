import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { logAudit } from "@/shared/lib/audit-log";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const pkg = await prisma.examPackage.findUnique({
      where: { id },
      include: {
        sections: {
          include: { _count: { select: { questions: true } } },
        },
      },
    });

    if (!pkg) return notFoundResponse("Paket ujian");

    const insufficientSections = pkg.sections.filter(
      (s) => s._count.questions < s.totalQuestions
    );

    if (insufficientSections.length > 0) {
      return errorResponse(
        "INSUFFICIENT_QUESTIONS",
        `Section "${insufficientSections[0].title}" membutuhkan ${insufficientSections[0].totalQuestions} soal, baru ada ${insufficientSections[0]._count.questions}`,
        400
      );
    }

    const updated = await prisma.examPackage.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });

    logAudit({
      userId: admin.id,
      action: "UPDATE",
      entity: "ExamPackage",
      entityId: id,
      oldData: { status: pkg.status },
      newData: { status: "PUBLISHED" },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
