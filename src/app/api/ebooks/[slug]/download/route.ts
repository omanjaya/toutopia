import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAuth();
    const { slug } = await params;

    const ebook = await prisma.ebook.findUnique({
      where: { slug },
      select: { id: true, status: true, pdfUrl: true },
    });

    if (!ebook || ebook.status !== "PUBLISHED" || !ebook.pdfUrl) {
      return errorResponse("NOT_FOUND", "Ebook tidak ditemukan", 404);
    }

    await prisma.ebook.update({
      where: { id: ebook.id },
      data: { downloadCount: { increment: 1 } },
    });

    return successResponse({ downloaded: true });
  } catch (error) {
    return handleApiError(error);
  }
}
