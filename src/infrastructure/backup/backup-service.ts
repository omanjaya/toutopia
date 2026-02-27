import { prisma } from "@/shared/lib/prisma";
import { getRedis } from "@/infrastructure/cache/redis.client";
import type { Prisma } from "@prisma/client";
import type { BackupFile, BackupQuestion } from "@/shared/lib/validators/backup.validators";

const EXPORT_BATCH_SIZE = 100;
const IMPORT_BATCH_SIZE = 50;
const JOB_TTL_SECONDS = 3600; // 1 hour

export interface JobProgress {
  status: "processing" | "done" | "error";
  progress: number;
  total: number;
  processed: number;
  error?: string;
  result?: unknown;
}

async function setJobProgress(jobId: string, progress: JobProgress): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.set(
      `backup:job:${jobId}`,
      JSON.stringify(progress),
      "EX",
      JOB_TTL_SECONDS
    );
  }
}

export async function getJobProgress(jobId: string): Promise<JobProgress | null> {
  const redis = await getRedis();
  if (!redis) return null;
  const data = await redis.get(`backup:job:${jobId}`);
  if (!data) return null;
  return JSON.parse(data) as JobProgress;
}

export async function processBackupJob(
  jobId: string,
  filters: {
    categoryId?: string;
    topicId?: string;
    status?: string;
    difficulty?: string;
  }
): Promise<BackupFile> {
  const where: Prisma.QuestionWhereInput = {};

  if (filters.status) {
    where.status = filters.status as Prisma.EnumQuestionStatusFilter;
  }
  if (filters.difficulty) {
    where.difficulty = filters.difficulty as Prisma.EnumQuestionDifficultyFilter;
  }
  if (filters.topicId) {
    where.topicId = filters.topicId;
  }
  if (filters.categoryId) {
    where.topic = {
      subject: {
        subCategory: { categoryId: filters.categoryId },
      },
    };
  }

  const total = await prisma.question.count({ where });

  await setJobProgress(jobId, {
    status: "processing",
    progress: 0,
    total,
    processed: 0,
  });

  const allQuestions: BackupQuestion[] = [];
  let cursor: string | undefined;
  let processed = 0;

  while (true) {
    const batch = await prisma.question.findMany({
      where,
      take: EXPORT_BATCH_SIZE,
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
      orderBy: { id: "asc" },
      include: {
        options: { orderBy: { order: "asc" } },
        topic: {
          include: {
            subject: {
              include: {
                subCategory: {
                  include: { category: true },
                },
              },
            },
          },
        },
      },
    });

    if (batch.length === 0) break;

    for (const q of batch) {
      allQuestions.push({
        content: q.content,
        type: q.type,
        difficulty: q.difficulty,
        explanation: q.explanation ?? null,
        source: q.source ?? null,
        year: q.year ?? null,
        imageUrl: q.imageUrl ?? null,
        topicSlug: q.topic.slug,
        subjectSlug: q.topic.subject.slug,
        subCategorySlug: q.topic.subject.subCategory.slug,
        categorySlug: q.topic.subject.subCategory.category.slug,
        options: q.options.map((opt) => ({
          label: opt.label,
          content: opt.content,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })),
      });
    }

    cursor = batch[batch.length - 1].id;
    processed += batch.length;

    await setJobProgress(jobId, {
      status: "processing",
      progress: total > 0 ? Math.round((processed / total) * 100) : 100,
      total,
      processed,
    });
  }

  const backupFile: BackupFile = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    totalQuestions: allQuestions.length,
    questions: allQuestions,
  };

  await setJobProgress(jobId, {
    status: "done",
    progress: 100,
    total,
    processed: total,
    result: { totalExported: allQuestions.length },
  });

  return backupFile;
}

function hashQuestion(q: BackupQuestion, topicId: string): string {
  const raw = `${q.content}::${topicId}::${q.type}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

interface TopicLookupResult {
  id: string;
  slug: string;
  subject: {
    slug: string;
    subCategory: {
      slug: string;
      category: { slug: string };
    };
  };
}

export interface RestorePreview {
  totalInFile: number;
  valid: number;
  duplicates: number;
  invalidTopics: number;
  errors: string[];
  perTopic: Record<string, number>;
}

export async function previewRestore(
  questions: BackupQuestion[]
): Promise<RestorePreview> {
  const topics = await prisma.topic.findMany({
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

  const topicMap = new Map<string, TopicLookupResult>();
  for (const t of topics) {
    const key = `${t.subject.subCategory.category.slug}/${t.subject.subCategory.slug}/${t.subject.slug}/${t.slug}`;
    topicMap.set(key, {
      id: t.id,
      slug: t.slug,
      subject: {
        slug: t.subject.slug,
        subCategory: {
          slug: t.subject.subCategory.slug,
          category: { slug: t.subject.subCategory.category.slug },
        },
      },
    });
  }

  const existingQuestions = await prisma.question.findMany({
    select: { content: true, topicId: true, type: true },
  });
  const existingHashes = new Set<string>();
  for (const eq of existingQuestions) {
    const raw = `${eq.content}::${eq.topicId}::${eq.type}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    existingHashes.add(hash.toString(36));
  }

  let valid = 0;
  let duplicates = 0;
  let invalidTopics = 0;
  const errors: string[] = [];
  const perTopic: Record<string, number> = {};

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const topicKey = `${q.categorySlug}/${q.subCategorySlug}/${q.subjectSlug}/${q.topicSlug}`;
    const topic = topicMap.get(topicKey);

    if (!topic) {
      invalidTopics++;
      errors.push(`Soal #${i + 1}: Topik tidak ditemukan (${topicKey})`);
      continue;
    }

    const h = hashQuestion(q, topic.id);
    if (existingHashes.has(h)) {
      duplicates++;
      continue;
    }

    valid++;
    const topicLabel = `${q.categorySlug} > ${q.topicSlug}`;
    perTopic[topicLabel] = (perTopic[topicLabel] ?? 0) + 1;
  }

  return {
    totalInFile: questions.length,
    valid,
    duplicates,
    invalidTopics,
    errors: errors.slice(0, 50),
    perTopic,
  };
}

export async function processRestoreJob(
  jobId: string,
  questions: BackupQuestion[],
  userId: string
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const topics = await prisma.topic.findMany({
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

  const topicMap = new Map<string, string>();
  for (const t of topics) {
    const key = `${t.subject.subCategory.category.slug}/${t.subject.subCategory.slug}/${t.subject.slug}/${t.slug}`;
    topicMap.set(key, t.id);
  }

  const existingQuestions = await prisma.question.findMany({
    select: { content: true, topicId: true, type: true },
  });
  const existingHashes = new Set<string>();
  for (const eq of existingQuestions) {
    const raw = `${eq.content}::${eq.topicId}::${eq.type}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    existingHashes.add(hash.toString(36));
  }

  const total = questions.length;
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  await setJobProgress(jobId, {
    status: "processing",
    progress: 0,
    total,
    processed: 0,
  });

  for (let i = 0; i < questions.length; i += IMPORT_BATCH_SIZE) {
    const batch = questions.slice(i, i + IMPORT_BATCH_SIZE);
    const creates: Prisma.QuestionCreateManyInput[] = [];
    const optionCreates: Array<{
      tempIndex: number;
      options: Array<{
        label: string;
        content: string;
        isCorrect: boolean;
        order: number;
      }>;
    }> = [];

    for (let j = 0; j < batch.length; j++) {
      const q = batch[j];
      const globalIdx = i + j;
      const topicKey = `${q.categorySlug}/${q.subCategorySlug}/${q.subjectSlug}/${q.topicSlug}`;
      const topicId = topicMap.get(topicKey);

      if (!topicId) {
        skipped++;
        errors.push(`Soal #${globalIdx + 1}: Topik tidak ditemukan`);
        continue;
      }

      const h = hashQuestion(q, topicId);
      if (existingHashes.has(h)) {
        skipped++;
        continue;
      }

      creates.push({
        topicId,
        createdById: userId,
        type: q.type,
        status: "APPROVED",
        difficulty: q.difficulty,
        content: q.content,
        explanation: q.explanation ?? null,
        source: q.source ?? null,
        year: q.year ?? null,
        imageUrl: q.imageUrl ?? null,
      });

      optionCreates.push({
        tempIndex: creates.length - 1,
        options: q.options.map((opt) => ({
          label: opt.label,
          content: opt.content,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })),
      });

      existingHashes.add(h);
    }

    if (creates.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (let k = 0; k < creates.length; k++) {
          const data = creates[k];
          const opts = optionCreates.find((o) => o.tempIndex === k);
          await tx.question.create({
            data: {
              ...data,
              options: opts
                ? { create: opts.options }
                : undefined,
            },
          });
        }
      });
      imported += creates.length;
    }

    const processed = Math.min(i + IMPORT_BATCH_SIZE, total);
    await setJobProgress(jobId, {
      status: "processing",
      progress: Math.round((processed / total) * 100),
      total,
      processed,
    });
  }

  await setJobProgress(jobId, {
    status: "done",
    progress: 100,
    total,
    processed: total,
    result: { imported, skipped, errorCount: errors.length },
  });

  return { imported, skipped, errors: errors.slice(0, 50) };
}
