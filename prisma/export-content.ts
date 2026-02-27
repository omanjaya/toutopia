/**
 * Export articles, ebooks, and any new topics/subjects from the database
 * into a self-contained seed file.
 *
 * Usage: npx tsx prisma/export-content.ts
 * Output: prisma/seed-content-exported.ts
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { resolve } from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("Exporting content from database...\n");

  // 1. Export full category → subcategory → subject → topic hierarchy
  const categories = await prisma.examCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      name: true,
      slug: true,
      description: true,
      icon: true,
      order: true,
      isActive: true,
      subCategories: {
        orderBy: { order: "asc" },
        select: {
          name: true,
          slug: true,
          order: true,
          subjects: {
            orderBy: { order: "asc" },
            select: {
              name: true,
              slug: true,
              order: true,
              topics: {
                orderBy: { order: "asc" },
                select: {
                  name: true,
                  slug: true,
                  order: true,
                },
              },
            },
          },
        },
      },
    },
  });
  console.log(`  Categories: ${categories.length}`);
  let topicCount = 0;
  for (const c of categories) {
    for (const sc of c.subCategories) {
      for (const s of sc.subjects) {
        topicCount += s.topics.length;
      }
    }
  }
  console.log(`  Topics: ${topicCount}`);

  // 2. Export articles
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      category: true,
      tags: true,
      status: true,
      publishedAt: true,
      coverImage: true,
    },
  });
  console.log(`  Articles: ${articles.length}`);

  // 3. Export ebooks
  const ebooks = await prisma.ebook.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      title: true,
      slug: true,
      description: true,
      contentType: true,
      htmlContent: true,
      pdfUrl: true,
      coverImage: true,
      category: true,
      tags: true,
      status: true,
      publishedAt: true,
      pageCount: true,
    },
  });
  console.log(`  Ebooks: ${ebooks.length}`);

  // 4. Export badges
  const badges = await prisma.badge.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      slug: true,
      name: true,
      description: true,
      icon: true,
      category: true,
      requirement: true,
      xpReward: true,
    },
  });
  console.log(`  Badges: ${badges.length}`);

  // 5. Generate seed file
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    categories,
    articles: articles.map((a) => ({
      ...a,
      publishedAt: a.publishedAt?.toISOString() ?? null,
    })),
    ebooks: ebooks.map((e) => ({
      ...e,
      publishedAt: e.publishedAt?.toISOString() ?? null,
    })),
    badges,
  };

  const seedContent = generateSeedFile(data);
  const outputPath = resolve(__dirname, "seed-content-exported.ts");
  writeFileSync(outputPath, seedContent, "utf-8");

  console.log(`\n✅ Exported ${categories.length} categories, ${topicCount} topics, ${articles.length} articles, ${ebooks.length} ebooks, ${badges.length} badges`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Run with: npx tsx prisma/seed-content-exported.ts`);
}

function generateSeedFile(data: Record<string, unknown>): string {
  const json = JSON.stringify(data, null, 2);

  return `/**
 * Auto-generated content seed — exported on ${(data as { exportedAt: string }).exportedAt}
 * Contains categories/topics hierarchy, articles, ebooks, and badges.
 *
 * Usage: npx tsx prisma/seed-content-exported.ts
 * This REPLACES seed.ts + seed-articles.ts + seed-ebooks.ts
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "argon2";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DATA = ${json};

async function main(): Promise<void> {
  console.log("Seeding content (categories, topics, articles, ebooks, badges)...\\n");

  // ── Step 0: Ensure admin exists ──
  const adminPassword = await hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@toutopia.id" },
    update: {},
    create: {
      email: "admin@toutopia.id",
      name: "Super Admin",
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      credits: {
        create: { balance: 0, freeCredits: 0 },
      },
    },
  });
  console.log("  Admin: " + admin.email);

  // ── Step 1: Categories → SubCategories → Subjects → Topics ──
  console.log("\\nSeeding categories & topics...");
  for (const cat of DATA.categories) {
    const category = await prisma.examCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
      },
    });

    for (const sub of cat.subCategories) {
      const subCategory = await prisma.examSubCategory.upsert({
        where: {
          categoryId_slug: { categoryId: category.id, slug: sub.slug },
        },
        update: { name: sub.name, order: sub.order },
        create: {
          categoryId: category.id,
          name: sub.name,
          slug: sub.slug,
          order: sub.order,
        },
      });

      for (const subj of sub.subjects) {
        const subject = await prisma.subject.upsert({
          where: {
            subCategoryId_slug: { subCategoryId: subCategory.id, slug: subj.slug },
          },
          update: { name: subj.name, order: subj.order },
          create: {
            subCategoryId: subCategory.id,
            name: subj.name,
            slug: subj.slug,
            order: subj.order,
          },
        });

        for (const topic of subj.topics) {
          await prisma.topic.upsert({
            where: {
              subjectId_slug: { subjectId: subject.id, slug: topic.slug },
            },
            update: { name: topic.name, order: topic.order },
            create: {
              subjectId: subject.id,
              name: topic.name,
              slug: topic.slug,
              order: topic.order,
            },
          });
        }
      }
    }
    console.log("  ✓ " + cat.name + " (" + cat.subCategories.length + " sub, " +
      cat.subCategories.reduce((sum: number, sc: { subjects: { topics: unknown[] }[] }) =>
        sum + sc.subjects.reduce((s2: number, subj: { topics: unknown[] }) => s2 + subj.topics.length, 0), 0) + " topics)");
  }

  // ── Step 2: Articles ──
  console.log("\\nSeeding articles...");
  for (const article of DATA.articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        status: article.status,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        coverImage: article.coverImage,
      },
      create: {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        status: article.status,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        coverImage: article.coverImage,
        authorId: admin.id,
      },
    });
    console.log("  ✓ " + article.title);
  }

  // ── Step 3: Ebooks ──
  console.log("\\nSeeding ebooks...");
  for (const ebook of DATA.ebooks) {
    await prisma.ebook.upsert({
      where: { slug: ebook.slug },
      update: {
        title: ebook.title,
        description: ebook.description,
        contentType: ebook.contentType,
        htmlContent: ebook.htmlContent,
        pdfUrl: ebook.pdfUrl,
        coverImage: ebook.coverImage,
        category: ebook.category,
        tags: ebook.tags,
        status: ebook.status,
        publishedAt: ebook.publishedAt ? new Date(ebook.publishedAt) : null,
        pageCount: ebook.pageCount,
      },
      create: {
        title: ebook.title,
        slug: ebook.slug,
        description: ebook.description,
        contentType: ebook.contentType,
        htmlContent: ebook.htmlContent,
        pdfUrl: ebook.pdfUrl,
        coverImage: ebook.coverImage,
        category: ebook.category,
        tags: ebook.tags,
        status: ebook.status,
        publishedAt: ebook.publishedAt ? new Date(ebook.publishedAt) : null,
        pageCount: ebook.pageCount,
        authorId: admin.id,
      },
    });
    console.log("  ✓ " + ebook.title);
  }

  // ── Step 4: Badges ──
  console.log("\\nSeeding badges...");
  for (const badge of DATA.badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        requirement: badge.requirement as Record<string, unknown>,
        xpReward: badge.xpReward,
      },
      create: {
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        requirement: badge.requirement as Record<string, unknown>,
        xpReward: badge.xpReward,
      },
    });
  }
  console.log("  ✓ " + DATA.badges.length + " badges");

  console.log("\\n✅ Content seeding complete!");
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
