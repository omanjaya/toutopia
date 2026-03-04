import { prisma } from "@/shared/lib/prisma";

export interface EbookListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  contentType: string;
  category: string | null;
  pageCount: number | null;
  viewCount: number;
  publishedAt: Date | null;
  author: { name: string | null };
}

export interface EbookListItemWithPrice extends EbookListItem {
  isFree: boolean;
  price: number | null;
}

export interface GetEbooksOptions {
  category?: string;
  query?: string;
  limit?: number;
}

/**
 * Fetches published ebooks with optional category and full-text query filters.
 * Returns fields common to both mobile and desktop views.
 * Used by both desktop and mobile ebook list pages.
 */
export async function getEbooks(
  options: GetEbooksOptions = {},
): Promise<EbookListItem[]> {
  const { category, query, limit = 24 } = options;
  return prisma.ebook.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              {
                description: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      contentType: true,
      category: true,
      pageCount: true,
      viewCount: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

/**
 * Fetches published ebooks including isFree and price fields (used by desktop).
 * Used only by the desktop ebook list page.
 */
export async function getEbooksWithPrice(
  options: GetEbooksOptions = {},
): Promise<EbookListItemWithPrice[]> {
  const { category, query, limit = 24 } = options;
  return prisma.ebook.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              {
                description: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      contentType: true,
      category: true,
      pageCount: true,
      viewCount: true,
      isFree: true,
      price: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

/**
 * Returns the distinct non-null category strings of all published ebooks.
 * Used by both desktop and mobile ebook list pages.
 */
export async function getEbookCategories(): Promise<string[]> {
  const results = await prisma.ebook.findMany({
    where: { status: "PUBLISHED", category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });
  return results.map((r: { category: string | null }) => r.category).filter(Boolean) as string[];
}
