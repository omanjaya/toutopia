import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateTaskSchema } from "@/shared/lib/validators/planner.validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const data = updateTaskSchema.parse(body);

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
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        startTime: data.startTime,
        duration: data.duration,
        priority: data.priority,
        repeatRule: data.repeatRule,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
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

    await prisma.studyTask.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
