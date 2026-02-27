import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createEbookSchema } from "@/shared/lib/validators/ebook.validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const [ebooks, total] = await Promise.all([
      prisma.ebook.findMany({
        orderBy: { createdAt: "desc" },
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
          status: true,
          viewCount: true,
          downloadCount: true,
          pageCount: true,
          publishedAt: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      }),
      prisma.ebook.count(),
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const data = createEbookSchema.parse(body);

    const ebook = await prisma.ebook.create({
      data: {
        authorId: user.id,
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        coverImage: data.coverImage ?? null,
        contentType: data.contentType,
        htmlContent: data.htmlContent ?? null,
        pdfUrl: data.pdfUrl ?? null,
        fileSize: data.fileSize ?? null,
        pageCount: data.pageCount ?? null,
        category: data.category ?? null,
        tags: data.tags ?? [],
        status: data.status ?? "DRAFT",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return successResponse(ebook, undefined, 201);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        "DUPLICATE_SLUG",
        "Slug sudah digunakan, gunakan slug lain",
        409
      );
    }
    return handleApiError(error);
  }
}
