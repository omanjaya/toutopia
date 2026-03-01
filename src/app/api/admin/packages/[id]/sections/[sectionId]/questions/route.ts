import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const addQuestionsSchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id: packageId, sectionId } = await params;

    const section = await prisma.examSection.findFirst({
      where: { id: sectionId, packageId },
      select: { id: true },
    });

    if (!section) return notFoundResponse("Seksi ujian");

    const questions = await prisma.examSectionQuestion.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
      include: {
        question: {
          select: {
            id: true,
            content: true,
            type: true,
            difficulty: true,
            status: true,
            options: { orderBy: { order: "asc" }, select: { id: true, label: true, content: true, isCorrect: true, order: true } },
          },
        },
      },
    });

    return successResponse(questions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id: packageId, sectionId } = await params;

    const body = await request.json();
    const { questionIds } = addQuestionsSchema.parse(body);

    // Verify section belongs to this package
    const section = await prisma.examSection.findFirst({
      where: { id: sectionId, packageId },
      select: { id: true, totalQuestions: true },
    });

    if (!section) return notFoundResponse("Seksi ujian");

    // Validate all questionIds are APPROVED questions
    const approvedQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds }, status: "APPROVED" },
      select: { id: true },
    });

    if (approvedQuestions.length !== questionIds.length) {
      const foundIds = new Set(approvedQuestions.map((q) => q.id));
      const invalidIds = questionIds.filter((id) => !foundIds.has(id));
      return errorResponse(
        "INVALID_QUESTIONS",
        `Beberapa soal tidak ditemukan atau belum disetujui: ${invalidIds.join(", ")}`,
        400
      );
    }

    // Count existing questions in this section
    const currentCount = await prisma.examSectionQuestion.count({
      where: { sectionId },
    });

    const capacity = section.totalQuestions - currentCount;
    if (capacity <= 0) {
      return errorResponse(
        "SECTION_FULL",
        "Seksi sudah penuh. Tidak ada kapasitas untuk soal tambahan",
        400
      );
    }

    if (questionIds.length > capacity) {
      return errorResponse(
        "EXCEEDS_CAPACITY",
        `Hanya tersedia ${capacity} slot di seksi ini, tetapi ${questionIds.length} soal ingin ditambahkan`,
        400
      );
    }

    // Check for duplicates (questions already in this section)
    const existingLinks = await prisma.examSectionQuestion.findMany({
      where: { sectionId, questionId: { in: questionIds } },
      select: { questionId: true },
    });

    if (existingLinks.length > 0) {
      const duplicateIds = existingLinks.map((l) => l.questionId);
      return errorResponse(
        "DUPLICATE_QUESTIONS",
        `Soal berikut sudah ada di seksi ini: ${duplicateIds.join(", ")}`,
        409
      );
    }

    // Create ExamSectionQuestion records with incrementing order
    await prisma.examSectionQuestion.createMany({
      data: questionIds.map((questionId, idx) => ({
        sectionId,
        questionId,
        order: currentCount + idx,
      })),
    });

    return successResponse({ added: questionIds.length }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
