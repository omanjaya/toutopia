import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function POST(): Promise<Response> {
  try {
    const user = await requireAuth();

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
