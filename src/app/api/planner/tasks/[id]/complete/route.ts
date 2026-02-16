import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const task = await prisma.studyTask.findUnique({
      where: { id },
      include: { plan: { select: { userId: true } } },
    });

    if (!task || task.plan.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Task tidak ditemukan", 404);
    }

    const updated = await prisma.studyTask.update({
      where: { id },
      data: {
        isCompleted: !task.isCompleted,
        completedAt: !task.isCompleted ? new Date() : null,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
