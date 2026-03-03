import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { decrypt } from "@/shared/lib/encryption";
import { generateQuestions } from "@/infrastructure/ai/ai-provider.service";
import { cacheSet } from "@/infrastructure/cache/cache.service";
import { getRedis } from "@/infrastructure/cache/redis.client";
import { getTemplateForExam, type ExamType, type SectionTemplate } from "@/shared/lib/exam-templates";
import {
  buildSpecializationInstruction,
  getSpecializationName,
} from "@/shared/lib/specialization-data";
import { z } from "zod";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

interface SubjectWithTopics {
  id: string;
  name: string;
  topics: { id: string; name: string; order: number }[];
}

interface CreatedSection {
  id: string;
  title: string;
  subjectId: string;
  totalQuestions: number;
}

const JOB_TTL = 3600;

const autoGenerateSchema = z.object({
  examType: z.enum(["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"]),
  specialization: z.string().optional(),
  categoryId: z.string().min(1),
  provider: z.string().min(1),
  model: z.string().optional(),
  difficulty: z
    .enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD", "MIXED"])
    .default("MIXED"),
  quantity: z.number().int().min(1).max(10).default(1),
  price: z.number().int().min(0).default(0),
  isFree: z.boolean().default(true),
});

interface AutoGenSectionState {
  title: string;
  status: "pending" | "processing" | "done" | "error";
  generated: number;
  total: number;
  error?: string;
}

interface AutoGenPackageState {
  packageId: string;
  title: string;
  status: "pending" | "processing" | "done" | "error";
  sections: AutoGenSectionState[];
}

export interface AutoGenJobState {
  status: "processing" | "done" | "error";
  progress: number;
  error?: string;
  packages: AutoGenPackageState[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function updateJobState(jobId: string, state: AutoGenJobState): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.set(`auto-gen:job:${jobId}`, JSON.stringify(state), "EX", JOB_TTL);
  }
}

interface SubjectMatch {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
}

function matchSectionToSubject(
  sectionTitle: string,
  subjects: SubjectWithTopics[]
): SubjectMatch | null {
  const lowerTitle = sectionTitle.toLowerCase();

  // Try substring match: subject name in section title or vice versa
  for (const subj of subjects) {
    const lowerSubj = subj.name.toLowerCase();
    if (lowerTitle.includes(lowerSubj) || lowerSubj.includes(lowerTitle)) {
      const topic = subj.topics[0];
      if (topic) {
        return {
          subjectId: subj.id,
          subjectName: subj.name,
          topicId: topic.id,
          topicName: topic.name,
        };
      }
    }
  }

  // Try partial keyword matching for common patterns
  const keywords = lowerTitle.split(/[\s\-–—]+/).filter((w) => w.length > 2);
  for (const subj of subjects) {
    const lowerSubj = subj.name.toLowerCase();
    const matchCount = keywords.filter((kw) => lowerSubj.includes(kw)).length;
    if (matchCount >= 2 || (keywords.length === 1 && lowerSubj.includes(keywords[0]))) {
      const topic = subj.topics[0];
      if (topic) {
        return {
          subjectId: subj.id,
          subjectName: subj.name,
          topicId: topic.id,
          topicName: topic.name,
        };
      }
    }
  }

  // Fallback: first subject with topics
  const fallback = subjects.find((s) => s.topics.length > 0);
  if (fallback) {
    return {
      subjectId: fallback.id,
      subjectName: fallback.name,
      topicId: fallback.topics[0].id,
      topicName: fallback.topics[0].name,
    };
  }

  return null;
}

async function processAutoGenerateJob(
  jobId: string,
  adminUserId: string,
  data: z.infer<typeof autoGenerateSchema>,
  template: SectionTemplate[],
  subjects: SubjectWithTopics[],
  providerApiKey: string,
  resolvedModel: string
): Promise<void> {
  const specName = data.specialization
    ? getSpecializationName(data.examType, data.specialization)
    : null;

  const customInstruction = buildSpecializationInstruction(
    data.examType,
    data.specialization,
    specName ?? undefined
  );

  const totalSteps = data.quantity * template.length;
  let completedSteps = 0;

  const jobState: AutoGenJobState = {
    status: "processing",
    progress: 0,
    packages: [],
  };

  for (let pkgIdx = 0; pkgIdx < data.quantity; pkgIdx++) {
    const pkgNum = pkgIdx + 1;
    const titleBase = specName
      ? `${data.examType} - ${specName}`
      : data.examType;
    const title = data.quantity > 1 ? `${titleBase} #${pkgNum}` : titleBase;
    const slug = slugify(`${title}-${Date.now()}-${pkgNum}`);

    const durationMinutes = template.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalQuestions = template.reduce((sum, s) => sum + s.totalQuestions, 0);

    // Map template sections to subject matches
    const sectionMappings = template.map((tpl) => ({
      template: tpl,
      match: matchSectionToSubject(tpl.title, subjects),
    }));

    // Create package + sections in transaction
    const pkg = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const created = await tx.examPackage.create({
        data: {
          categoryId: data.categoryId,
          title,
          slug,
          price: data.price,
          isFree: data.isFree,
          durationMinutes,
          totalQuestions,
          status: "DRAFT",
          createdById: adminUserId,
          maxAttempts: 1,
          isAntiCheat: true,
        },
        select: { id: true, title: true },
      });

      const sections = await Promise.all(
        sectionMappings.map((mapping, idx) =>
          tx.examSection.create({
            data: {
              packageId: created.id,
              subjectId: mapping.match?.subjectId ?? subjects[0]?.id ?? "",
              title: mapping.template.title,
              durationMinutes: mapping.template.durationMinutes,
              totalQuestions: mapping.template.totalQuestions,
              order: idx,
            },
            select: { id: true, title: true, subjectId: true, totalQuestions: true },
          })
        )
      );

      return { ...created, sections };
    });

    const pkgState: AutoGenPackageState = {
      packageId: pkg.id,
      title: pkg.title,
      status: "processing",
      sections: pkg.sections.map((s: CreatedSection) => ({
        title: s.title,
        status: "pending" as const,
        generated: 0,
        total: s.totalQuestions,
      })),
    };

    jobState.packages.push(pkgState);
    await updateJobState(jobId, jobState);

    // Generate questions for each section
    for (let secIdx = 0; secIdx < pkg.sections.length; secIdx++) {
      const section = pkg.sections[secIdx];
      const mapping = sectionMappings[secIdx];
      const match = mapping.match;

      pkgState.sections[secIdx].status = "processing";
      await updateJobState(jobId, jobState);

      if (!match) {
        pkgState.sections[secIdx].status = "error";
        pkgState.sections[secIdx].error = "Tidak ada subject yang cocok";
        completedSteps++;
        jobState.progress = Math.round((completedSteps / totalSteps) * 100);
        await updateJobState(jobId, jobState);
        continue;
      }

      try {
        let totalGenerated = 0;
        const needed = section.totalQuestions;
        const maxPerCall = 20;

        // Loop for large sections (cap 20 per call)
        while (totalGenerated < needed) {
          const batchCount = Math.min(maxPerCall, needed - totalGenerated);

          const questions = await generateQuestions({
            provider: data.provider,
            model: resolvedModel,
            apiKey: providerApiKey,
            subtest: match.subjectName,
            topic: match.topicName,
            difficulty: data.difficulty,
            count: batchCount,
            type: "SINGLE_CHOICE",
            examType: data.examType,
            customInstruction: customInstruction || undefined,
          });

          // Save to DB
          await prisma.$transaction(async (tx: PrismaTransactionClient) => {
            for (let j = 0; j < questions.length; j++) {
              const q = questions[j];
              const saved = await tx.question.create({
                data: {
                  topicId: match.topicId,
                  createdById: adminUserId,
                  type: q.type as "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "NUMERIC",
                  status: "APPROVED",
                  difficulty: q.difficulty as "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD",
                  content: q.content,
                  explanation: q.explanation ?? null,
                  source: `AI Auto-Generate (${data.provider})`,
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
                  order: totalGenerated + j,
                },
              });
            }
          });

          totalGenerated += questions.length;

          // Update progress for partial section completion
          pkgState.sections[secIdx].generated = totalGenerated;
          await updateJobState(jobId, jobState);
        }

        pkgState.sections[secIdx].status = "done";
        pkgState.sections[secIdx].generated = totalGenerated;
      } catch (err) {
        pkgState.sections[secIdx].status = "error";
        pkgState.sections[secIdx].error =
          err instanceof Error ? err.message : "Gagal generate soal";
      }

      completedSteps++;
      jobState.progress = Math.round((completedSteps / totalSteps) * 100);
      await updateJobState(jobId, jobState);
    }

    // Mark package done
    const hasError = pkgState.sections.some((s) => s.status === "error");
    pkgState.status = hasError ? "error" : "done";
    await updateJobState(jobId, jobState);
  }

  jobState.status = "done";
  jobState.progress = 100;
  await updateJobState(jobId, jobState);
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const data = autoGenerateSchema.parse(body);

    // Verify category exists and load subjects
    const category = await prisma.examCategory.findUnique({
      where: { id: data.categoryId },
      select: {
        id: true,
        name: true,
        subCategories: {
          select: {
            subjects: {
              select: {
                id: true,
                name: true,
                topics: {
                  select: { id: true, name: true, order: true },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return errorResponse("CATEGORY_NOT_FOUND", "Kategori tidak ditemukan", 404);
    }

    const allSubjects = category.subCategories.flatMap(
      (sc: { subjects: SubjectWithTopics[] }) => sc.subjects
    );

    if (allSubjects.length === 0) {
      return errorResponse(
        "NO_SUBJECTS",
        "Kategori ini belum memiliki subject. Buat subject terlebih dahulu.",
        400
      );
    }

    // Get AI provider config
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
    const resolvedModel = data.model ?? providerConfig.model;

    // Resolve template
    const template = getTemplateForExam(
      data.examType as ExamType,
      data.specialization
    );

    if (template.length === 0) {
      return errorResponse(
        "NO_TEMPLATE",
        "Template tidak ditemukan untuk tipe ujian ini",
        400
      );
    }

    const jobId = randomUUID();

    // Store initial state
    await cacheSet(
      `auto-gen:job:${jobId}`,
      {
        status: "processing",
        progress: 0,
        packages: [],
      } satisfies AutoGenJobState,
      JOB_TTL
    );

    // Fire and forget
    processAutoGenerateJob(
      jobId,
      user.id,
      data,
      template,
      allSubjects,
      apiKey,
      resolvedModel
    ).catch(async (err) => {
      const redis = await getRedis();
      if (redis) {
        await redis.set(
          `auto-gen:job:${jobId}`,
          JSON.stringify({
            status: "error",
            progress: 0,
            error:
              err instanceof Error
                ? err.message
                : "Auto-generate gagal. Silakan coba lagi.",
            packages: [],
          } satisfies AutoGenJobState),
          "EX",
          JOB_TTL
        );
      }
    });

    return successResponse({ jobId, template });
  } catch (error) {
    return handleApiError(error);
  }
}
