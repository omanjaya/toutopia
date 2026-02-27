/**
 * Export all questions, exam packages, sections, and category structure
 * from the current database into a self-contained seed file.
 *
 * Usage: npx tsx prisma/export-questions.ts
 * Output: prisma/seed-exported.ts (ready to run with `npx tsx prisma/seed-exported.ts`)
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { resolve } from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ExportedOption {
  label: string;
  content: string;
  isCorrect: boolean;
  imageUrl: string | null;
  order: number;
}

interface ExportedQuestion {
  content: string;
  type: string;
  difficulty: string;
  status: string;
  explanation: string | null;
  source: string | null;
  year: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  metadata: unknown;
  topicSlug: string;
  subjectSlug: string;
  subCategorySlug: string;
  categorySlug: string;
  options: ExportedOption[];
}

interface ExportedSectionQuestion {
  questionIndex: number;
  order: number;
}

interface ExportedSection {
  title: string;
  subjectSlug: string;
  durationMinutes: number;
  totalQuestions: number;
  order: number;
  questions: ExportedSectionQuestion[];
}

interface ExportedPackage {
  title: string;
  slug: string;
  description: string | null;
  categorySlug: string;
  price: number;
  discountPrice: number | null;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number | null;
  isFree: boolean;
  isAntiCheat: boolean;
  isCatMode: boolean;
  status: string;
  maxAttempts: number;
  sections: ExportedSection[];
}

interface ExportData {
  version: string;
  exportedAt: string;
  totalQuestions: number;
  totalPackages: number;
  questions: ExportedQuestion[];
  packages: ExportedPackage[];
}

async function main(): Promise<void> {
  console.log("Exporting questions and packages from database...\n");

  // 1. Export all questions with full hierarchy
  const questions = await prisma.question.findMany({
    orderBy: [{ topic: { subject: { subCategory: { category: { order: "asc" } } } } }, { createdAt: "asc" }],
    select: {
      id: true,
      content: true,
      type: true,
      difficulty: true,
      status: true,
      explanation: true,
      source: true,
      year: true,
      imageUrl: true,
      videoUrl: true,
      metadata: true,
      topic: {
        select: {
          slug: true,
          subject: {
            select: {
              slug: true,
              subCategory: {
                select: {
                  slug: true,
                  category: {
                    select: { slug: true },
                  },
                },
              },
            },
          },
        },
      },
      options: {
        orderBy: { order: "asc" },
        select: {
          label: true,
          content: true,
          isCorrect: true,
          imageUrl: true,
          order: true,
        },
      },
    },
  });

  console.log(`  Found ${questions.length} questions`);

  // Build question ID → index map for package references
  const questionIdToIndex = new Map<string, number>();
  const exportedQuestions: ExportedQuestion[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    questionIdToIndex.set(q.id, i);
    exportedQuestions.push({
      content: q.content,
      type: q.type,
      difficulty: q.difficulty,
      status: q.status,
      explanation: q.explanation,
      source: q.source,
      year: q.year,
      imageUrl: q.imageUrl,
      videoUrl: q.videoUrl,
      metadata: q.metadata,
      topicSlug: q.topic.slug,
      subjectSlug: q.topic.subject.slug,
      subCategorySlug: q.topic.subject.subCategory.slug,
      categorySlug: q.topic.subject.subCategory.category.slug,
      options: q.options,
    });
  }

  // 2. Export all exam packages with sections and question mappings
  const packages = await prisma.examPackage.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      discountPrice: true,
      durationMinutes: true,
      totalQuestions: true,
      passingScore: true,
      isFree: true,
      isAntiCheat: true,
      isCatMode: true,
      status: true,
      maxAttempts: true,
      category: {
        select: { slug: true },
      },
      sections: {
        orderBy: { order: "asc" },
        select: {
          title: true,
          durationMinutes: true,
          totalQuestions: true,
          order: true,
          subject: {
            select: { slug: true },
          },
          questions: {
            orderBy: { order: "asc" },
            select: {
              order: true,
              questionId: true,
            },
          },
        },
      },
    },
  });

  console.log(`  Found ${packages.length} packages`);

  const exportedPackages: ExportedPackage[] = [];

  for (const pkg of packages) {
    const sections: ExportedSection[] = pkg.sections.map((sec) => ({
      title: sec.title,
      subjectSlug: sec.subject.slug,
      durationMinutes: sec.durationMinutes,
      totalQuestions: sec.totalQuestions,
      order: sec.order,
      questions: sec.questions.map((sq) => ({
        questionIndex: questionIdToIndex.get(sq.questionId) ?? -1,
        order: sq.order,
      })),
    }));

    exportedPackages.push({
      title: pkg.title,
      slug: pkg.slug,
      description: pkg.description,
      categorySlug: pkg.category.slug,
      price: pkg.price,
      discountPrice: pkg.discountPrice,
      durationMinutes: pkg.durationMinutes,
      totalQuestions: pkg.totalQuestions,
      passingScore: pkg.passingScore,
      isFree: pkg.isFree,
      isAntiCheat: pkg.isAntiCheat,
      isCatMode: pkg.isCatMode,
      status: pkg.status,
      maxAttempts: pkg.maxAttempts,
      sections,
    });
  }

  // Check for missing question references
  let missingRefs = 0;
  for (const pkg of exportedPackages) {
    for (const sec of pkg.sections) {
      for (const sq of sec.questions) {
        if (sq.questionIndex === -1) missingRefs++;
      }
    }
  }
  if (missingRefs > 0) {
    console.warn(`  ⚠ ${missingRefs} section-question references could not be resolved`);
  }

  const exportData: ExportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    totalQuestions: exportedQuestions.length,
    totalPackages: exportedPackages.length,
    questions: exportedQuestions,
    packages: exportedPackages,
  };

  // 3. Generate the seed file
  const seedContent = generateSeedFile(exportData);
  const outputPath = resolve(__dirname, "seed-exported.ts");
  writeFileSync(outputPath, seedContent, "utf-8");

  console.log(`\n✅ Exported ${exportedQuestions.length} questions and ${exportedPackages.length} packages`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Run with: npx tsx prisma/seed-exported.ts`);
}

function generateSeedFile(data: ExportData): string {
  const json = JSON.stringify(data, null, 2);

  return `/**
 * Auto-generated seed file — exported on ${data.exportedAt}
 * Contains ${data.totalQuestions} questions and ${data.totalPackages} packages
 *
 * Usage: npx tsx prisma/seed-exported.ts
 * Prerequisites: Run \`npx tsx prisma/seed.ts\` first (creates categories, subjects, topics)
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, QuestionDifficulty, QuestionStatus, QuestionType, ExamPackageStatus } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EXPORT_DATA = ${json} as const;

type ExportedQuestion = (typeof EXPORT_DATA.questions)[number];
type ExportedPackage = (typeof EXPORT_DATA.packages)[number];

async function main(): Promise<void> {
  console.log(\`Seeding \${EXPORT_DATA.totalQuestions} questions and \${EXPORT_DATA.totalPackages} packages...\\n\`);

  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (!admin) throw new Error("Admin user not found. Run seed.ts first.");

  // Build topic lookup: "categorySlug/subCategorySlug/subjectSlug/topicSlug" → topicId
  const allTopics = await prisma.topic.findMany({
    select: {
      id: true,
      slug: true,
      subject: {
        select: {
          slug: true,
          subCategory: {
            select: {
              slug: true,
              category: { select: { slug: true } },
            },
          },
        },
      },
    },
  });

  const topicMap = new Map<string, string>();
  for (const t of allTopics) {
    const key = \`\${t.subject.subCategory.category.slug}/\${t.subject.subCategory.slug}/\${t.subject.slug}/\${t.slug}\`;
    topicMap.set(key, t.id);
  }

  // Build subject lookup
  const allSubjects = await prisma.subject.findMany({
    select: {
      id: true,
      slug: true,
      subCategory: {
        select: {
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
  });

  const subjectMap = new Map<string, string>();
  for (const s of allSubjects) {
    const key = \`\${s.subCategory.category.slug}/\${s.subCategory.slug}/\${s.slug}\`;
    subjectMap.set(key, s.id);
  }

  // Build category lookup
  const allCategories = await prisma.examCategory.findMany({
    select: { id: true, slug: true },
  });
  const categoryMap = new Map<string, string>();
  for (const c of allCategories) {
    categoryMap.set(c.slug, c.id);
  }

  // ── Step 1: Create all questions ──
  console.log("Creating questions...");
  const questionIds: string[] = [];
  let created = 0;
  let skipped = 0;

  for (const q of EXPORT_DATA.questions) {
    const topicKey = \`\${q.categorySlug}/\${q.subCategorySlug}/\${q.subjectSlug}/\${q.topicSlug}\`;
    const topicId = topicMap.get(topicKey);

    if (!topicId) {
      console.warn(\`  ⚠ Topic not found: \${topicKey}, skipping question\`);
      questionIds.push("");
      skipped++;
      continue;
    }

    // Check for duplicate by content + topicId
    const existing = await prisma.question.findFirst({
      where: {
        topicId,
        content: q.content,
      },
      select: { id: true },
    });

    if (existing) {
      questionIds.push(existing.id);
      skipped++;
      continue;
    }

    const question = await prisma.question.create({
      data: {
        topicId,
        createdById: admin.id,
        type: q.type as QuestionType,
        difficulty: q.difficulty as QuestionDifficulty,
        status: q.status as QuestionStatus,
        content: q.content,
        explanation: q.explanation ?? undefined,
        source: q.source ?? undefined,
        year: q.year ?? undefined,
        imageUrl: q.imageUrl ?? undefined,
        videoUrl: q.videoUrl ?? undefined,
        metadata: (q.metadata as Record<string, unknown>) ?? undefined,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        options: {
          create: q.options.map((opt, idx) => ({
            label: opt.label,
            content: opt.content,
            isCorrect: opt.isCorrect,
            imageUrl: opt.imageUrl ?? undefined,
            order: opt.order ?? idx,
          })),
        },
      },
    });

    questionIds.push(question.id);
    created++;
  }

  console.log(\`  ✓ Questions: \${created} created, \${skipped} skipped (existing/missing topic)\`);

  // ── Step 2: Create all exam packages ──
  console.log("\\nCreating exam packages...");

  for (const pkg of EXPORT_DATA.packages) {
    const categoryId = categoryMap.get(pkg.categorySlug);
    if (!categoryId) {
      console.warn(\`  ⚠ Category not found: \${pkg.categorySlug}, skipping package "\${pkg.title}"\`);
      continue;
    }

    // Delete existing package with same slug (cascade)
    const existing = await prisma.examPackage.findUnique({
      where: { slug: pkg.slug },
      select: { id: true },
    });

    if (existing) {
      // Clean up dependent data
      const attempts = await prisma.examAttempt.findMany({
        where: { packageId: existing.id },
        select: { id: true },
      });
      const attemptIds = attempts.map((a) => a.id);

      if (attemptIds.length > 0) {
        await prisma.leaderboardEntry.deleteMany({ where: { attemptId: { in: attemptIds } } });
        await prisma.examAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } });
        await prisma.tabViolationEvent.deleteMany({ where: { attemptId: { in: attemptIds } } });
        await prisma.examAttempt.deleteMany({ where: { id: { in: attemptIds } } });
      }

      await prisma.examSectionQuestion.deleteMany({
        where: { section: { packageId: existing.id } },
      });
      await prisma.examSection.deleteMany({ where: { packageId: existing.id } });
      await prisma.examPackage.delete({ where: { id: existing.id } });
      console.log(\`  ↻ Replaced existing package: \${pkg.slug}\`);
    }

    const examPackage = await prisma.examPackage.create({
      data: {
        categoryId,
        title: pkg.title,
        slug: pkg.slug,
        description: pkg.description,
        price: pkg.price,
        discountPrice: pkg.discountPrice,
        durationMinutes: pkg.durationMinutes,
        totalQuestions: pkg.totalQuestions,
        passingScore: pkg.passingScore,
        isFree: pkg.isFree,
        isAntiCheat: pkg.isAntiCheat,
        isCatMode: pkg.isCatMode,
        status: pkg.status as ExamPackageStatus,
        maxAttempts: pkg.maxAttempts,
        createdById: admin.id,
      },
    });

    for (const sec of pkg.sections) {
      const subjectKey = \`\${pkg.categorySlug}/\${sec.subjectSlug}\`;
      // Find subject ID — try all subcategories
      let subjectId: string | undefined;
      for (const [key, id] of subjectMap.entries()) {
        if (key.startsWith(pkg.categorySlug + "/") && key.endsWith("/" + sec.subjectSlug)) {
          subjectId = id;
          break;
        }
      }

      if (!subjectId) {
        console.warn(\`  ⚠ Subject not found for key pattern: \${pkg.categorySlug}/*/\${sec.subjectSlug}\`);
        continue;
      }

      const section = await prisma.examSection.create({
        data: {
          packageId: examPackage.id,
          subjectId,
          title: sec.title,
          durationMinutes: sec.durationMinutes,
          totalQuestions: sec.totalQuestions,
          order: sec.order,
        },
      });

      // Link questions to section
      for (const sq of sec.questions) {
        const qId = questionIds[sq.questionIndex];
        if (!qId) {
          console.warn(\`  ⚠ Question index \${sq.questionIndex} not found for section "\${sec.title}"\`);
          continue;
        }

        await prisma.examSectionQuestion.create({
          data: {
            sectionId: section.id,
            questionId: qId,
            order: sq.order,
          },
        });
      }

      console.log(\`  ✓ Section: \${sec.title} (\${sec.questions.length} soal)\`);
    }

    console.log(\`  ✅ Package: \${pkg.title}\`);
  }

  console.log(\`\\n✅ Seeding complete! \${created} questions, \${EXPORT_DATA.totalPackages} packages\`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
