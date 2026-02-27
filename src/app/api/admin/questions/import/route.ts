import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { parseImportFile } from "@/infrastructure/ai/import-parser";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const topicId = formData.get("topicId") as string | null;
    const action = formData.get("action") as string | null; // "preview" or "save"
    const source = formData.get("source") as string | null;

    if (!file) {
      return errorResponse("FILE_REQUIRED", "File diperlukan", 400);
    }

    if (!topicId) {
      return errorResponse("TOPIC_REQUIRED", "Topik diperlukan", 400);
    }

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return errorResponse("TOPIC_NOT_FOUND", "Topik tidak ditemukan", 404);
    }

    // Determine file type
    const fileName = file.name.toLowerCase();
    let fileType: "json" | "md";
    if (fileName.endsWith(".json")) {
      fileType = "json";
    } else if (fileName.endsWith(".md") || fileName.endsWith(".markdown") || fileName.endsWith(".txt")) {
      fileType = "md";
    } else {
      return errorResponse(
        "UNSUPPORTED_FORMAT",
        "Format file tidak didukung. Gunakan .json atau .md",
        400
      );
    }

    // Read file content
    const text = await file.text();
    if (!text || text.trim().length === 0) {
      return errorResponse("FILE_EMPTY", "File kosong", 400);
    }

    // Parse
    const result = parseImportFile(text, fileType);

    // Preview mode — just return parsed results
    if (action !== "save") {
      return successResponse({
        questions: result.questions,
        errors: result.errors,
        totalParsed: result.questions.length,
        totalErrors: result.errors.length,
      });
    }

    // Save mode — insert into database
    if (result.questions.length === 0) {
      return errorResponse(
        "NO_VALID_QUESTIONS",
        "Tidak ada soal yang valid untuk disimpan",
        400
      );
    }

    const created = await prisma.$transaction(
      result.questions.map((q) =>
        prisma.question.create({
          data: {
            topicId,
            createdById: user.id,
            type: q.type as "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "NUMERIC",
            status: "APPROVED",
            difficulty: q.difficulty as "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD",
            content: q.content,
            explanation: q.explanation || null,
            source: source ?? `Import: ${file.name}`,
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
      {
        saved: created.length,
        errors: result.errors,
        ids: created.map((q) => q.id),
      },
      undefined,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
