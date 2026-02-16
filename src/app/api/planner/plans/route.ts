import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createPlanSchema } from "@/shared/lib/validators/planner.validators";

export async function GET() {
  try {
    const user = await requireAuth();

    const plans = await prisma.studyPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { tasks: true } },
        tasks: {
          where: { isCompleted: true },
          select: { id: true },
        },
      },
    });

    const result = plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      categoryId: plan.categoryId,
      categoryName: plan.category?.name ?? null,
      targetDate: plan.targetDate?.toISOString() ?? null,
      isActive: plan.isActive,
      totalTasks: plan._count.tasks,
      completedTasks: plan.tasks.length,
      createdAt: plan.createdAt.toISOString(),
    }));

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = createPlanSchema.parse(body);

    const plan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description ?? null,
        categoryId: data.categoryId ?? null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      },
    });

    return successResponse(plan, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
