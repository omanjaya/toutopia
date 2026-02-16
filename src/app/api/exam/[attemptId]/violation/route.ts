import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const violationSchema = z.object({
  type: z.string().min(1),
  details: z.string().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireAuth();
    const { attemptId } = await params;
    const body = await request.json();
    const data = violationSchema.parse(body);

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Sesi ujian tidak ditemukan", 404);
    }

    if (attempt.status !== "IN_PROGRESS") {
      return errorResponse("EXAM_ENDED", "Sesi ujian sudah berakhir", 400);
    }

    await prisma.$transaction([
      prisma.tabViolationEvent.create({
        data: {
          attemptId,
          type: data.type,
          details: data.details ?? null,
        },
      }),
      prisma.examAttempt.update({
        where: { id: attemptId },
        data: { violations: { increment: 1 } },
      }),
    ]);

    return successResponse({ recorded: true });
  } catch (error) {
    return handleApiError(error);
  }
}
