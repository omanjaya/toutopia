import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { decrypt } from "@/shared/lib/encryption";
import { generateQuestions } from "@/infrastructure/ai/ai-provider.service";
import { cacheSet } from "@/infrastructure/cache/cache.service";
import { getRedis } from "@/infrastructure/cache/redis.client";
import { z } from "zod";

const BATCH_JOB_TTL = 3600;

const batchGenerateSchema = z.object({
  provider: z.string().min(1),
  model: z.string().optional(),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD", "MIXED"]).default("MIXED"),
  examType: z.enum(["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"]),
  jabatan: z.string().optional(),
});

interface BatchSectionState {
  sectionId: string;
  title: string;
  status: "pending" | "processing" | "done" | "error";
  generated: number;
  needed: number;
  error?: string;
}

interface BatchGenerateJob {
  status: "processing" | "done" | "error";
  progress: number;
  error?: string;
  sections: BatchSectionState[];
}

async function updateJobState(jobId: string, state: BatchGenerateJob): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.set(
      `batch-generate:job:${jobId}`,
      JSON.stringify(state),
      "EX",
      BATCH_JOB_TTL
    );
  }
}

async function processBatchGenerateJob(
  jobId: string,
  packageId: string,
  adminUserId: string,
  data: z.infer<typeof batchGenerateSchema>,
  providerApiKey: string,
  model: string
): Promise<void> {
  const sections = await prisma.examSection.findMany({
    where: { packageId },
    include: { subject: true },
    orderBy: { order: "asc" },
  });

  const initialSections: BatchSectionState[] = sections.map((s) => ({
    sectionId: s.id,
    title: s.title,
    status: "pending",
    generated: 0,
    needed: s.totalQuestions,
  }));

  const jobState: BatchGenerateJob = {
    status: "processing",
    progress: 0,
    sections: initialSections,
  };

  await updateJobState(jobId, jobState);

  const total = sections.length;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    // Update section to processing
    jobState.sections[i].status = "processing";
    await updateJobState(jobId, jobState);

    try {
      // Count existing questions
      const currentCount = await prisma.examSectionQuestion.count({
        where: { sectionId: section.id },
      });

      const needed = section.totalQuestions - currentCount;

      if (needed <= 0) {
        jobState.sections[i].status = "done";
        jobState.sections[i].generated = 0;
        jobState.sections[i].needed = 0;
        jobState.progress = Math.round(((i + 1) / total) * 100);
        await updateJobState(jobId, jobState);
        continue;
      }

      // Find first topic of section's subject
      const topic = await prisma.topic.findFirst({
        where: { subjectId: section.subjectId },
        orderBy: { order: "asc" },
      });

      if (!topic) {
        jobState.sections[i].status = "error";
        jobState.sections[i].error = "Tidak ada topik untuk subject ini";
        jobState.progress = Math.round(((i + 1) / total) * 100);
        await updateJobState(jobId, jobState);
        continue;
      }

      // Cap at 20 per call in batch mode to avoid response truncation
      const count = Math.min(needed, 20);

      const customInstruction = data.jabatan
        ? `Jabatan: ${data.jabatan}. Soal harus relevan dengan kompetensi teknis jabatan ini.`
        : undefined;

      const generatedQuestions = await generateQuestions({
        provider: data.provider,
        model,
        apiKey: providerApiKey,
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
        for (let j = 0; j < generatedQuestions.length; j++) {
          const q = generatedQuestions[j];
          const saved = await tx.question.create({
            data: {
              topicId: topic.id,
              createdById: adminUserId,
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
              sectionId: section.id,
              questionId: saved.id,
              order: currentCount + j,
            },
          });
        }
      });

      jobState.sections[i].status = "done";
      jobState.sections[i].generated = generatedQuestions.length;
      jobState.sections[i].needed = needed;
    } catch (err) {
      jobState.sections[i].status = "error";
      jobState.sections[i].error =
        err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui";
    }

    jobState.progress = Math.round(((i + 1) / total) * 100);
    await updateJobState(jobId, jobState);
  }

  jobState.status = "done";
  jobState.progress = 100;
  await updateJobState(jobId, jobState);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireAdmin();
    const { id: packageId } = await params;

    const body = await request.json();
    const data = batchGenerateSchema.parse(body);

    const pkg = await prisma.examPackage.findUnique({
      where: { id: packageId },
      select: { id: true, title: true },
    });

    if (!pkg) return notFoundResponse("Paket ujian");

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

    const jobId = randomUUID();

    // Store initial state in Redis
    await cacheSet(
      `batch-generate:job:${jobId}`,
      {
        status: "processing",
        progress: 0,
        sections: [],
      } satisfies BatchGenerateJob,
      BATCH_JOB_TTL
    );

    // Fire and forget
    processBatchGenerateJob(jobId, packageId, user.id, data, apiKey, model).catch(
      async (err) => {
        const redis = await getRedis();
        if (redis) {
          await redis.set(
            `batch-generate:job:${jobId}`,
            JSON.stringify({
              status: "error",
              progress: 0,
              error: err instanceof Error ? err.message : "Batch generate gagal. Silakan coba lagi.",
              sections: [],
            } satisfies BatchGenerateJob),
            "EX",
            BATCH_JOB_TTL
          );
        }
      }
    );

    return successResponse({ jobId });
  } catch (error) {
    return handleApiError(error);
  }
}
