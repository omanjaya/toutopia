import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updatePlanSchema } from "@/shared/lib/validators/planner.validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const data = updatePlanSchema.parse(body);

    const plan = await prisma.studyPlan.findUnique({ where: { id } });

    if (!plan || plan.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Plan tidak ditemukan", 404);
    }

    const updated = await prisma.studyPlan.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        isActive: data.isActive,
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

    const plan = await prisma.studyPlan.findUnique({ where: { id } });

    if (!plan || plan.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Plan tidak ditemukan", 404);
    }

    await prisma.studyPlan.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
