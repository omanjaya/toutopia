import { prisma } from "@/shared/lib/prisma";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { cacheGet, cacheSet } from "@/infrastructure/cache/cache.service";

const CACHE_KEY = "categories:active";
const CACHE_TTL = 300; // 5 minutes

export async function GET() {
  try {
    const cached = await cacheGet<unknown[]>(CACHE_KEY);
    if (cached) return successResponse(cached);

    const categories = await prisma.examCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
    });

    await cacheSet(CACHE_KEY, categories, CACHE_TTL);

    return successResponse(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
