import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const schema = z.object({
  topicId: z.string().optional(),
  subjectId: z.string().optional(),
  categoryId: z.string().optional(),
  questionCount: z.number().min(5).max(50).default(10),
  difficulty: z
    .enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"])
    .optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await requireAuth();
    const body: unknown = await request.json();
    const data = schema.parse(body);

    // Build where clause for approved questions only
    const where: Prisma.QuestionWhereInput = { status: "APPROVED" };

    if (data.topicId) {
      where.topicId = data.topicId;
    } else if (data.subjectId) {
      where.topic = { subjectId: data.subjectId };
    } else if (data.categoryId) {
      where.topic = {
        subject: { subCategory: { categoryId: data.categoryId } },
      };
    }

    if (data.difficulty) {
      where.difficulty = data.difficulty;
    }

    // Get random questions
    const totalAvailable = await prisma.question.count({ where });
    if (totalAvailable === 0) {
      return errorResponse(
        "NO_QUESTIONS",
        "Tidak ada soal yang tersedia untuk filter ini",
        404
      );
    }

    const take = Math.min(data.questionCount, totalAvailable);

    // Fetch more for randomization
    const questions = await prisma.question.findMany({
      where,
      take: take * 3,
      select: {
        id: true,
        content: true,
        type: true,
        imageUrl: true,
        explanation: true,
        options: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            label: true,
            content: true,
            imageUrl: true,
            isCorrect: true,
          },
        },
        topic: {
          select: {
            name: true,
            subject: { select: { name: true } },
          },
        },
      },
    });

    // Shuffle and take required count
    const shuffled = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, take);

    // Return questions WITH correct answers (practice mode shows answers immediately)
    const practiceQuestions = shuffled.map((q, idx) => ({
      id: q.id,
      index: idx + 1,
      content: q.content,
      type: q.type,
      imageUrl: q.imageUrl,
      explanation: q.explanation,
      topicName: q.topic.name,
      subjectName: q.topic.subject.name,
      options: q.options.map((o) => ({
        id: o.id,
        label: o.label,
        content: o.content,
        imageUrl: o.imageUrl,
        isCorrect: o.isCorrect,
      })),
    }));

    return successResponse({
      questions: practiceQuestions,
      totalAvailable,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
