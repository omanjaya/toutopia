import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireTeacher } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

interface CsvQuestion {
  topicId: string;
  content: string;
  type: string;
  difficulty: string;
  explanation: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctOption: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCsv(text: string): CsvQuestion[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"/, "").replace(/"$/, ""));
  const questions: CsvQuestion[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim().replace(/^"/, "").replace(/"$/, "") ?? "";
    });

    questions.push({
      topicId: row.topicId ?? "",
      content: row.content ?? "",
      type: row.type ?? "SINGLE_CHOICE",
      difficulty: row.difficulty ?? "MEDIUM",
      explanation: row.explanation ?? "",
      optionA: row.optionA ?? "",
      optionB: row.optionB ?? "",
      optionC: row.optionC ?? "",
      optionD: row.optionD ?? "",
      optionE: row.optionE ?? "",
      correctOption: row.correctOption ?? "A",
    });
  }

  return questions;
}

const VALID_TYPES = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"] as const;
const VALID_DIFFICULTIES = ["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"] as const;
const VALID_OPTIONS = ["A", "B", "C", "D", "E"] as const;

type QuestionType = typeof VALID_TYPES[number];
type QuestionDifficulty = typeof VALID_DIFFICULTIES[number];

function isValidType(v: string): v is QuestionType {
  return (VALID_TYPES as readonly string[]).includes(v);
}

function isValidDifficulty(v: string): v is QuestionDifficulty {
  return (VALID_DIFFICULTIES as readonly string[]).includes(v);
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await requireTeacher();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("VALIDATION_ERROR", "File CSV wajib diupload", 422);
    }

    if (!file.name.endsWith(".csv")) {
      return errorResponse("VALIDATION_ERROR", "Hanya file CSV yang diizinkan", 422);
    }

    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("VALIDATION_ERROR", "Ukuran file maksimal 5MB", 422);
    }

    const text = await file.text();
    const questions = parseCsv(text);

    if (questions.length === 0) {
      return errorResponse("EMPTY_FILE", "File CSV kosong atau format tidak valid", 422);
    }

    if (questions.length > 100) {
      return errorResponse("TOO_MANY", "Maksimal 100 soal per import", 422);
    }

    // Validate all topicIds exist
    const topicIds = [...new Set(questions.map((q) => q.topicId))];
    const existingTopics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: { id: true },
    });
    const validTopicIds = new Set(existingTopics.map((t) => t.id));

    const errors: string[] = [];
    const validQuestions: CsvQuestion[] = [];

    questions.forEach((q, idx) => {
      const row = idx + 2; // 1-indexed + header row
      if (!q.content) {
        errors.push(`Baris ${row}: Konten soal kosong`);
        return;
      }
      if (!q.topicId || !validTopicIds.has(q.topicId)) {
        errors.push(`Baris ${row}: Topic ID tidak valid`);
        return;
      }
      if (!q.optionA || !q.optionB) {
        errors.push(`Baris ${row}: Minimal 2 opsi jawaban`);
        return;
      }
      if (!(VALID_OPTIONS as readonly string[]).includes(q.correctOption.toUpperCase())) {
        errors.push(`Baris ${row}: Jawaban benar harus A-E`);
        return;
      }
      validQuestions.push(q);
    });

    if (validQuestions.length === 0) {
      return errorResponse("VALIDATION_ERROR", "Tidak ada soal yang valid", 422, { errors });
    }

    // Create questions in transaction
    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      const labels = ["A", "B", "C", "D", "E"];

      for (const q of validQuestions) {
        const optionValues = [q.optionA, q.optionB, q.optionC, q.optionD, q.optionE].filter(Boolean);

        const questionType: QuestionType = isValidType(q.type) ? q.type : "SINGLE_CHOICE";
        const questionDifficulty: QuestionDifficulty = isValidDifficulty(q.difficulty) ? q.difficulty : "MEDIUM";

        const question = await tx.question.create({
          data: {
            topicId: q.topicId,
            createdById: user.id,
            type: questionType,
            difficulty: questionDifficulty,
            content: q.content,
            explanation: q.explanation || null,
            status: "PENDING_REVIEW",
            options: {
              create: optionValues.map((content, idx) => ({
                label: labels[idx],
                content,
                isCorrect: labels[idx] === q.correctOption.toUpperCase(),
                order: idx,
              })),
            },
          },
        });
        results.push(question);
      }
      return results;
    });

    return successResponse(
      {
        imported: created.length,
        errors: errors.length > 0 ? errors : undefined,
        total: questions.length,
      },
      undefined,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
