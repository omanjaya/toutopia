import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAuth();
    const { slug } = await params;

    const ebook = await prisma.ebook.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, avatar: true } },
      },
    });

    if (!ebook || ebook.status !== "PUBLISHED") {
      return errorResponse("NOT_FOUND", "Ebook tidak ditemukan", 404);
    }

    // Increment view count (fire-and-forget)
    prisma.ebook
      .update({
        where: { id: ebook.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return successResponse(ebook);
  } catch (error) {
    return handleApiError(error);
  }
}
