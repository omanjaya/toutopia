import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkRateLimit } from "@/shared/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`search:${ip}`, { maxRequests: 30, windowMs: 60000 });
    if (!rl.success) {
      return errorResponse("RATE_LIMITED", "Terlalu banyak permintaan", 429);
    }

    const q = request.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return successResponse({ packages: [], articles: [] });
    }

    const [packages, articles] = await Promise.all([
      prisma.examPackage.findMany({
        where: {
          status: "PUBLISHED",
          title: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: 5,
      }),
      prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          title: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: 5,
      }),
    ]);

    return successResponse({ packages, articles });
  } catch (error) {
    return handleApiError(error);
  }
}
