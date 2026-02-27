import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireTeacher } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateQuestionSchema } from "@/shared/lib/validators/question.validators";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireTeacher();
    const { id } = await context.params;

    const question = await prisma.question.findUnique({
      where: { id },
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
    });

    if (!question || question.createdById !== user.id) {
      return notFoundResponse("Soal");
    }

    return successResponse(question);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireTeacher();
    const { id } = await context.params;

    const question = await prisma.question.findUnique({
      where: { id },
      select: { id: true, createdById: true, status: true },
    });

    if (!question || question.createdById !== user.id) {
      return notFoundResponse("Soal");
    }

    if (question.status !== "DRAFT" && question.status !== "REJECTED") {
      return errorResponse(
        "EDIT_NOT_ALLOWED",
        "Hanya soal berstatus DRAFT atau REJECTED yang bisa diedit",
        400
      );
    }

    const body = await request.json();
    const data = updateQuestionSchema.parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      // Delete existing options if new options provided
      if (data.options) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
      }

      return tx.question.update({
        where: { id },
        data: {
          ...(data.topicId !== undefined && { topicId: data.topicId }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.explanation !== undefined && { explanation: data.explanation }),
          ...(data.source !== undefined && { source: data.source }),
          ...(data.year !== undefined && { year: data.year }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          status: "PENDING_REVIEW",
          ...(data.options && {
            options: {
              create: data.options.map((opt) => ({
                label: opt.label,
                content: opt.content,
                isCorrect: opt.isCorrect,
                order: opt.order,
                imageUrl: opt.imageUrl ?? null,
              })),
            },
          }),
        },
        include: {
          options: { orderBy: { order: "asc" } },
        },
      });
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireTeacher();
    const { id } = await context.params;

    const question = await prisma.question.findUnique({
      where: { id },
      select: { id: true, createdById: true, status: true },
    });

    if (!question || question.createdById !== user.id) {
      return notFoundResponse("Soal");
    }

    if (question.status !== "DRAFT") {
      return errorResponse(
        "DELETE_NOT_ALLOWED",
        "Hanya soal berstatus DRAFT yang bisa dihapus",
        400
      );
    }

    await prisma.$transaction([
      prisma.questionOption.deleteMany({ where: { questionId: id } }),
      prisma.question.delete({ where: { id } }),
    ]);

    return successResponse({ message: "Soal berhasil dihapus" });
  } catch (error) {
    return handleApiError(error);
  }
}
