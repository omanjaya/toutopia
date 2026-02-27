import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { decrypt } from "@/shared/lib/encryption";
import {
  generateQuestions,
  validateGeneratedQuestionsWithAI,
  getPromptPreview,
} from "@/infrastructure/ai/ai-provider.service";
import { z } from "zod";

const generateSchema = z.object({
  provider: z.string().min(1),
  model: z.string().optional(),
  topicId: z.string().min(1),
  count: z.number().int().min(1).max(50),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD", "MIXED"]),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]),
  examType: z.enum(["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"]),
  customInstruction: z.string().optional(),
  enableValidation: z.boolean().optional(),
  validatorProvider: z.string().optional(),
  validatorModel: z.string().optional(),
});

const previewSchema = z.object({
  topicId: z.string().min(1),
  count: z.number().int().min(1).max(50),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD", "MIXED"]),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]),
  examType: z.enum(["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"]),
  customInstruction: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = generateSchema.parse(body);

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

    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
      include: {
        subject: {
          include: {
            subCategory: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!topic) {
      return errorResponse("TOPIC_NOT_FOUND", "Topik tidak ditemukan", 404);
    }

    const apiKey = decrypt(providerConfig.apiKey);
    const model = data.model ?? providerConfig.model;

    const questions = await generateQuestions({
      provider: data.provider,
      model,
      apiKey,
      subtest: topic.subject.name,
      topic: topic.name,
      difficulty: data.difficulty,
      count: data.count,
      type: data.type,
      examType: data.examType,
      customInstruction: data.customInstruction,
    });

    // Optional validation step
    let validation = null;
    if (data.enableValidation && questions.length > 0) {
      const valProvider = data.validatorProvider ?? data.provider;
      const valModel = data.validatorModel ?? model;

      let valApiKey = apiKey;
      if (valProvider !== data.provider) {
        const valConfig = await prisma.aiProviderConfig.findUnique({
          where: { provider: valProvider },
        });
        if (valConfig?.isActive) {
          valApiKey = decrypt(valConfig.apiKey);
        }
      }

      try {
        validation = await validateGeneratedQuestionsWithAI({
          provider: valProvider,
          model: valModel,
          apiKey: valApiKey,
          questions,
        });

        // Apply corrected explanations from validator
        if (validation) {
          for (const v of validation) {
            if (v.correctedExplanation && questions[v.index]) {
              questions[v.index].explanation = v.correctedExplanation;
            }
          }
        }
      } catch {
        // Validation is optional — don't fail the whole request
        validation = null;
      }
    }

    return successResponse({
      questions,
      validation,
      meta: {
        provider: data.provider,
        model,
        topic: topic.name,
        subject: topic.subject.name,
        category: topic.subject.subCategory.category.name,
        generated: questions.length,
        requested: data.count,
        validated: validation !== null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = previewSchema.parse(body);

    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
      include: {
        subject: {
          include: {
            subCategory: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!topic) {
      return errorResponse("TOPIC_NOT_FOUND", "Topik tidak ditemukan", 404);
    }

    const prompt = getPromptPreview({
      subtest: topic.subject.name,
      topic: topic.name,
      difficulty: data.difficulty,
      count: data.count,
      type: data.type,
      examType: data.examType,
      customInstruction: data.customInstruction,
    });

    return successResponse({ prompt });
  } catch (error) {
    return handleApiError(error);
  }
}
