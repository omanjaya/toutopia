import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError, AppError } from "@/shared/lib/api-error";
import { z } from "zod";

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

const bookmarkSchema = z.object({
  questionId: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAuth();
    const body: unknown = await request.json();
    const parsed = bookmarkSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "questionId wajib diisi", 400);
    }

    const { questionId } = parsed.data;

    // Upsert: create if not exists, ignore if already bookmarked
    const bookmark = await prisma.questionBookmark.upsert({
      where: { userId_questionId: { userId: user.id, questionId } },
      create: { userId: user.id, questionId },
      update: {},
    });

    return successResponse(bookmark);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const user = await requireAuth();
    const body: unknown = await request.json();
    const parsed = bookmarkSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "questionId wajib diisi", 400);
    }

    const { questionId } = parsed.data;

    await prisma.questionBookmark.deleteMany({
      where: { userId: user.id, questionId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
