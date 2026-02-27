import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkRateLimit } from "@/shared/lib/rate-limit";

export async function GET(
  request: NextRequest,
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

    // Deduplicate view count: max 1 increment per IP per article per 5 minutes
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const viewKey = `article-view:${slug}:${ip}`;
    const viewLimited = checkRateLimit(viewKey, { maxRequests: 1, windowMs: 300000 });
    if (viewLimited.success) {
      prisma.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});
    }

    return successResponse(article);
  } catch (error) {
    return handleApiError(error);
  }
}
