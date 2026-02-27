import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10))
    );
    const category = searchParams.get("category");

    const where = {
      status: "PUBLISHED" as const,
      ...(category ? { category } : {}),
    };

    const [ebooks, total] = await Promise.all([
      prisma.ebook.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          contentType: true,
          category: true,
          pageCount: true,
          viewCount: true,
          publishedAt: true,
          author: { select: { name: true } },
        },
      }),
      prisma.ebook.count({ where }),
    ]);

    return successResponse(ebooks, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
