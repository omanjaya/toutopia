import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateQuestionSchema } from "@/shared/lib/validators/question.validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            subject: {
              include: {
                subCategory: {
                  include: { category: true },
                },
              },
            },
          },
        },
        options: { orderBy: { order: "asc" } },
      },
    });

    if (!question) return notFoundResponse("Soal");

    return successResponse(question);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updateQuestionSchema.parse(body);

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Soal");

    const question = await prisma.$transaction(async (tx) => {
      if (data.options) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        await tx.questionOption.createMany({
          data: data.options.map((opt) => ({
            questionId: id,
            label: opt.label,
            content: opt.content,
            imageUrl: opt.imageUrl ?? null,
            isCorrect: opt.isCorrect,
            order: opt.order,
          })),
        });
      }

      return tx.question.update({
        where: { id },
        data: {
          topicId: data.topicId,
          type: data.type,
          difficulty: data.difficulty,
          content: data.content,
          explanation: data.explanation,
          source: data.source,
          year: data.year,
          imageUrl: data.imageUrl,
        },
        include: { options: { orderBy: { order: "asc" } } },
      });
    });

    return successResponse(question);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Soal");

    await prisma.question.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
