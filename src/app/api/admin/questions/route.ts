import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { questionFilterSchema } from "@/shared/lib/validators/question.validators";
import { createQuestionSchema } from "@/shared/lib/validators/question.validators";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const filters = questionFilterSchema.parse(params);

    const where: Prisma.QuestionWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.type) where.type = filters.type;
    if (filters.search) {
      where.content = { contains: filters.search, mode: "insensitive" };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          topic: {
            include: {
              subject: {
                include: {
                  subCategory: {
                    include: { category: { select: { name: true } } },
                  },
                },
              },
            },
          },
          options: { orderBy: { order: "asc" } },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return successResponse(questions, {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const data = createQuestionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        topicId: data.topicId,
        createdById: user.id,
        type: data.type,
        status: "APPROVED",
        difficulty: data.difficulty,
        content: data.content,
        explanation: data.explanation ?? null,
        source: data.source ?? null,
        year: data.year ?? null,
        imageUrl: data.imageUrl ?? null,
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
