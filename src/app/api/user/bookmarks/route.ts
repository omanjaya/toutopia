import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    const bookmarks = await prisma.questionBookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        question: {
          select: {
            id: true,
            content: true,
            difficulty: true,
            topic: {
              select: {
                name: true,
                subject: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return successResponse(bookmarks);
  } catch (error) {
    return handleApiError(error);
  }
}
