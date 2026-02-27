import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const questionSchema = z.object({
  content: z.string().min(10),
  explanation: z.string().optional().default(""),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "NUMERIC"]),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        content: z.string().min(1),
        isCorrect: z.boolean(),
        order: z.number().int().min(0),
      })
    )
    .min(2)
    .max(6),
});

const saveSchema = z.object({
  topicId: z.string().min(1),
  source: z.string().optional(),
  questions: z.array(questionSchema).min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const data = saveSchema.parse(body);

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
    });

    if (!topic) {
      return errorResponse("TOPIC_NOT_FOUND", "Topik tidak ditemukan", 404);
    }

    // Bulk create questions in a transaction
    const created = await prisma.$transaction(
      data.questions.map((q) =>
        prisma.question.create({
          data: {
            topicId: data.topicId,
            createdById: user.id,
            type: q.type,
            status: "APPROVED",
            difficulty: q.difficulty,
            content: q.content,
            explanation: q.explanation || null,
            source: data.source ?? "AI Generated",
            options: {
              create: q.options.map((opt) => ({
                label: opt.label,
                content: opt.content,
                isCorrect: opt.isCorrect,
                order: opt.order,
              })),
            },
          },
          include: { options: true },
        })
      )
    );

    return successResponse(
      { saved: created.length, ids: created.map((q) => q.id) },
      undefined,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
