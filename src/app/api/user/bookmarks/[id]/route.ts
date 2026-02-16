import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError, NotFoundError } from "@/shared/lib/api-error";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const bookmark = await prisma.questionBookmark.findFirst({
      where: { id, userId: user.id },
    });

    if (!bookmark) {
      throw new NotFoundError("Bookmark");
    }

    await prisma.questionBookmark.delete({
      where: { id: bookmark.id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
