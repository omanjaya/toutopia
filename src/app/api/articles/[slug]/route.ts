import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, avatar: true } },
      },
    });

    if (!article || article.status !== "PUBLISHED") {
      return errorResponse("NOT_FOUND", "Artikel tidak ditemukan", 404);
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return successResponse(article);
  } catch (error) {
    return handleApiError(error);
  }
}
