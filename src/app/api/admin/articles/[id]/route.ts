import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateArticleSchema } from "@/shared/lib/validators/article.validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const article = await prisma.article.findUnique({ where: { id } });

    if (!article) {
      return errorResponse("NOT_FOUND", "Artikel tidak ditemukan", 404);
    }

    return successResponse(article);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updateArticleSchema.parse(body);

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("NOT_FOUND", "Artikel tidak ditemukan", 404);
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags,
        status: data.status,
        publishedAt:
          data.status === "PUBLISHED" && !existing.publishedAt
            ? new Date()
            : undefined,
      },
    });

    return successResponse(article);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.article.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
