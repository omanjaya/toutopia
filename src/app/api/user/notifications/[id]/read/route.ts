import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Notifikasi tidak ditemukan", 404);
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
