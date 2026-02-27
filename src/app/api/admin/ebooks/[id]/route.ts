import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateEbookSchema } from "@/shared/lib/validators/ebook.validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const ebook = await prisma.ebook.findUnique({ where: { id } });

    if (!ebook) {
      return errorResponse("NOT_FOUND", "Ebook tidak ditemukan", 404);
    }

    return successResponse(ebook);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updateEbookSchema.parse(body);

    const existing = await prisma.ebook.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("NOT_FOUND", "Ebook tidak ditemukan", 404);
    }

    const ebook = await prisma.ebook.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        coverImage: data.coverImage,
        contentType: data.contentType,
        htmlContent: data.htmlContent,
        pdfUrl: data.pdfUrl,
        fileSize: data.fileSize,
        pageCount: data.pageCount,
        category: data.category,
        tags: data.tags,
        status: data.status,
        publishedAt:
          data.status === "PUBLISHED" && !existing.publishedAt
            ? new Date()
            : undefined,
      },
    });

    return successResponse(ebook);
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.ebook.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
