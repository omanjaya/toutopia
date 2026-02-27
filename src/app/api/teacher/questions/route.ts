import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireTeacher } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createQuestionSchema } from "@/shared/lib/validators/question.validators";

export async function GET(request: NextRequest) {
  try {
    const user = await requireTeacher();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const where = { createdById: user.id };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          topic: {
            include: {
              subject: { select: { name: true } },
            },
          },
          options: { orderBy: { order: "asc" } },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return successResponse(questions, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireTeacher();
    const body = await request.json();
    const data = createQuestionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        topicId: data.topicId,
        createdById: user.id,
        type: data.type,
        difficulty: data.difficulty,
        content: data.content,
        explanation: data.explanation ?? null,
        source: data.source ?? null,
        year: data.year ?? null,
        imageUrl: data.imageUrl ?? null,
        status: "PENDING_REVIEW",
        options: {
          create: data.options.map((opt) => ({
            label: opt.label,
            content: opt.content,
            imageUrl: opt.imageUrl ?? null,
            isCorrect: opt.isCorrect,
            order: opt.order,
          })),
        },
      },
      include: { options: true },
    });

    return successResponse(question, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
