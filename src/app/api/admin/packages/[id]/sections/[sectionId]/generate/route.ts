import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { decrypt } from "@/shared/lib/encryption";
import { generateQuestions } from "@/infrastructure/ai/ai-provider.service";
import { z } from "zod";

const generateSectionSchema = z.object({
  provider: z.string().min(1),
  model: z.string().optional(),
  topicId: z.string().min(1),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD", "MIXED"]),
  examType: z.enum(["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"]),
  jabatan: z.string().optional(),
  customInstruction: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
): Promise<Response> {
  try {
    const user = await requireAdmin();
    const { id: packageId, sectionId } = await params;

    const body = await request.json();
    const data = generateSectionSchema.parse(body);

    // Verify package exists
    const pkg = await prisma.examPackage.findUnique({
      where: { id: packageId },
      select: { id: true, title: true },
    });

    if (!pkg) return notFoundResponse("Paket ujian");

    // Verify section belongs to this package
    const section = await prisma.examSection.findFirst({
      where: { id: sectionId, packageId },
      include: {
        subject: true,
      },
    });

    if (!section) return notFoundResponse("Seksi ujian");

    // Count currently linked questions
    const currentCount = await prisma.examSectionQuestion.count({
      where: { sectionId },
    });

    const needed = section.totalQuestions - currentCount;

    if (needed <= 0) {
      return errorResponse(
        "SECTION_FULL",
        "Seksi sudah memiliki cukup soal",
        400
      );
    }

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
      select: { id: true, name: true, subjectId: true },
    });

    if (!topic) return notFoundResponse("Topik");

    // Fetch provider config
    const providerConfig = await prisma.aiProviderConfig.findUnique({
      where: { provider: data.provider },
    });

    if (!providerConfig || !providerConfig.isActive) {
      return errorResponse(
        "PROVIDER_INACTIVE",
        `Provider "${data.provider}" tidak aktif atau belum dikonfigurasi`,
        400
      );
    }

    const apiKey = decrypt(providerConfig.apiKey);
    const model = data.model ?? providerConfig.model;

    // Cap at 50 per call
    const count = Math.min(needed, 50);

    // Merge jabatan into customInstruction if provided
    const customInstruction = data.jabatan
      ? `Jabatan: ${data.jabatan}. Soal harus relevan dengan kompetensi teknis jabatan ini. ${data.customInstruction ?? ""}`
      : data.customInstruction;

    const generatedQuestions = await generateQuestions({
      provider: data.provider,
      model,
      apiKey,
      subtest: section.subject.name,
      topic: topic.name,
      difficulty: data.difficulty,
      count,
      type: "SINGLE_CHOICE",
      examType: data.examType,
      customInstruction,
    });

    // Save questions and link to section in a transaction
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < generatedQuestions.length; i++) {
        const q = generatedQuestions[i];
        const saved = await tx.question.create({
          data: {
            topicId: data.topicId,
            createdById: user.id,
            type: q.type as "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "NUMERIC",
            status: "APPROVED",
            difficulty: q.difficulty as "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD",
            content: q.content,
            explanation: q.explanation ?? null,
            source: `AI Generated (${data.provider})`,
            options: {
              create: q.options.map((opt, idx) => ({
                label: opt.label,
                content: opt.content,
                isCorrect: opt.isCorrect,
                order: idx,
              })),
            },
          },
        });

        await tx.examSectionQuestion.create({
          data: {
            sectionId,
            questionId: saved.id,
            order: currentCount + i,
          },
        });
      }
    });

    const newCount = currentCount + generatedQuestions.length;
    const remaining = section.totalQuestions - newCount;

    return successResponse({
      generated: generatedQuestions.length,
      linked: generatedQuestions.length,
      sectionCurrent: newCount,
      sectionNeeded: section.totalQuestions,
      remaining: Math.max(0, remaining),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
