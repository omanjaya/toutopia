import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireTeacher } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createQuestionSchema } from "@/shared/lib/validators/question.validators";

export async function GET() {
  try {
    const user = await requireTeacher();

    const questions = await prisma.question.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        topic: {
          include: {
            subject: { select: { name: true } },
          },
        },
        options: { orderBy: { order: "asc" } },
      },
    });

    return successResponse(questions);
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
