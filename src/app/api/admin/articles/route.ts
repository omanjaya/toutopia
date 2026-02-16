import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createArticleSchema } from "@/shared/lib/validators/article.validators";

export async function GET() {
  try {
    await requireAdmin();

    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
      },
    });

    return successResponse(articles);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const data = createArticleSchema.parse(body);

    const article = await prisma.article.create({
      data: {
        authorId: user.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt ?? null,
        coverImage: data.coverImage ?? null,
        category: data.category ?? null,
        tags: data.tags ?? [],
        status: data.status ?? "DRAFT",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return successResponse(article, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
