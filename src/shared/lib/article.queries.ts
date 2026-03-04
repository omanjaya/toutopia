import { prisma } from "@/shared/lib/prisma";

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | null;
  author: { name: string | null };
}

export interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  author: { name: string | null; avatar: string | null };
}

export interface ArticleListResult {
  articles: ArticleListItem[];
  categories: string[];
}

export async function getArticles(params: {
  search?: string;
  category?: string;
}): Promise<ArticleListItem[]> {
  const { search, category } = params;

  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { excerpt: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

export async function getArticleCategories(): Promise<string[]> {
  const results: Array<{ category: string | null }> =
    await prisma.article.findMany({
      where: { status: "PUBLISHED", category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
  return results
    .map((r) => r.category)
    .filter((c): c is string => c !== null);
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleDetail | null> {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      category: true,
      tags: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true, avatar: true } },
    },
  });

  if (!article || article.status !== "PUBLISHED") return null;

  // Increment view count (fire-and-forget)
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  return article;
}
