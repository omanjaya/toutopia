import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createTaskSchema } from "@/shared/lib/validators/planner.validators";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const planId = searchParams.get("planId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {
      plan: { userId: user.id },
    };

    if (planId) {
      where.planId = planId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate);
    }

    const tasks = await prisma.studyTask.findMany({
      where,
      orderBy: [{ date: "asc" }, { priority: "desc" }],
      include: {
        plan: { select: { id: true, title: true } },
      },
    });

    return successResponse(tasks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = createTaskSchema.parse(body);

    // Verify plan belongs to user
    const plan = await prisma.studyPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan || plan.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Plan tidak ditemukan", 404);
    }

    const task = await prisma.studyTask.create({
      data: {
        planId: data.planId,
        title: data.title,
        description: data.description ?? null,
        date: new Date(data.date),
        startTime: data.startTime ?? null,
        duration: data.duration ?? null,
        priority: data.priority ?? 0,
        repeatRule: data.repeatRule ?? null,
      },
    });

    return successResponse(task, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
