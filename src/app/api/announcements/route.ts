import { prisma } from "@/shared/lib/prisma";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { cacheGet, cacheSet } from "@/infrastructure/cache/cache.service";

const CACHE_KEY = "announcements:active";
const CACHE_TTL = 120; // 2 minutes

export async function GET() {
  try {
    const cached = await cacheGet<unknown[]>(CACHE_KEY);
    if (cached) return successResponse(cached);

    const now = new Date();

    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        startAt: { lte: now },
        OR: [{ endAt: null }, { endAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    await cacheSet(CACHE_KEY, announcements, CACHE_TTL);

    return successResponse(announcements);
  } catch (error) {
    return handleApiError(error);
  }
}
