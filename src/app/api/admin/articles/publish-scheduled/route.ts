import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function POST(): Promise<Response> {
  try {
    await requireAdmin();

    const now = new Date();

    const dueArticles = await prisma.article.findMany({
      where: {
        status: "DRAFT",
        scheduledAt: { lte: now },
        content: { not: "" },
      },
      select: { id: true, title: true },
    });

    if (dueArticles.length === 0) {
      return successResponse({ published: 0 });
    }

    const ids = dueArticles.map((a: { id: string }) => a.id);

    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
      },
    });

    return successResponse({
      published: dueArticles.length,
      articles: dueArticles.map((a: { id: string; title: string }) => a.title),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
