import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { buildArticlePrompt } from "@/infrastructure/ai/prompts";
import { callAI } from "@/infrastructure/ai/ai-provider.service";

const generateSchema = z.object({
  provider: z.string().min(1, "Provider wajib diisi"),
  model: z.string().optional(),
  topic: z.string().min(3, "Topik minimal 3 karakter"),
  outline: z.string().optional(),
  category: z.string().optional(),
  tone: z.string().optional(),
  targetLength: z.number().int().min(300).max(5000).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = generateSchema.parse(body);

    const providerConfig = await prisma.aiProviderConfig.findFirst({
      where: { provider: data.provider, isActive: true },
      select: { apiKey: true, model: true },
    });

    if (!providerConfig) {
      return errorResponse(
        "AI_PROVIDER_NOT_CONFIGURED",
        `Provider "${data.provider}" belum dikonfigurasi atau tidak aktif`,
        400
      );
    }

    const model = data.model || providerConfig.model;
    const { system, user } = buildArticlePrompt({
      topic: data.topic,
      outline: data.outline,
      category: data.category,
      tone: data.tone,
      targetLength: data.targetLength,
    });

    const raw = await callAI(
      data.provider,
      providerConfig.apiKey,
      model,
      system,
      user,
      8192,
      0.7
    );

    let parsed: { title: string; content: string; excerpt: string; tags: string[] };
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return errorResponse(
        "AI_PARSE_ERROR",
        "AI mengembalikan respons yang tidak valid. Coba lagi.",
        500
      );
    }

    if (!parsed.title || !parsed.content) {
      return errorResponse(
        "AI_INCOMPLETE_RESPONSE",
        "AI mengembalikan respons yang tidak lengkap. Coba lagi.",
        500
      );
    }

    return successResponse({
      title: parsed.title,
      slug: slugify(parsed.title),
      content: parsed.content,
      excerpt: parsed.excerpt ?? "",
      tags: parsed.tags ?? [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
