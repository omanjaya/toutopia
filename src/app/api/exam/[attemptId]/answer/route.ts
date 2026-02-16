import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const saveAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().nullable().optional(),
  selectedOptions: z.array(z.string()).optional(),
  numericAnswer: z.number().nullable().optional(),
  isFlagged: z.boolean().optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireAuth();
    const { attemptId } = await params;
    const body = await request.json();
    const data = saveAnswerSchema.parse(body);

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Sesi ujian tidak ditemukan", 404);
    }

    if (attempt.status !== "IN_PROGRESS") {
      return errorResponse(
        "EXAM_ENDED",
        "Sesi ujian sudah berakhir",
        400
      );
    }

    // Server-side time check
    if (new Date() > attempt.serverDeadline) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: "TIMED_OUT", finishedAt: new Date() },
      });
      return errorResponse("TIME_UP", "Waktu ujian telah habis", 400);
    }

    const answer = await prisma.examAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: data.questionId,
        },
      },
      update: {
        selectedOptionId: data.selectedOptionId ?? null,
        selectedOptions: data.selectedOptions ?? [],
        numericAnswer: data.numericAnswer ?? null,
        isFlagged: data.isFlagged,
        timeSpentSeconds: data.timeSpentSeconds ?? 0,
        answeredAt: new Date(),
      },
      create: {
        attemptId,
        questionId: data.questionId,
        selectedOptionId: data.selectedOptionId ?? null,
        selectedOptions: data.selectedOptions ?? [],
        numericAnswer: data.numericAnswer ?? null,
        isFlagged: data.isFlagged ?? false,
        timeSpentSeconds: data.timeSpentSeconds ?? 0,
      },
    });

    return successResponse({ saved: true, answerId: answer.id });
  } catch (error) {
    return handleApiError(error);
  }
}
