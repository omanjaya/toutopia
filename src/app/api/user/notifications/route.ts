import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { sentAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          data: true,
          sentAt: true,
        },
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}
