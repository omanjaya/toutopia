import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
} from "@/shared/lib/api-response";
import { handleApiError, NotFoundError } from "@/shared/lib/api-error";
import { z } from "zod";

const updateSubjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  order: z.number().int().min(0).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { subjectId } = await params;
    const body: unknown = await req.json();
    const data = updateSubjectSchema.parse(body);

    const existing = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!existing) return notFoundResponse("Subject");

    const updateData: { name?: string; slug?: string; order?: number } = {};
    if (data.order !== undefined) updateData.order = data.order;

    if (data.name !== undefined) {
      updateData.name = data.name;
      const baseSlug = slugify(data.name);
      const conflicts = await prisma.subject.findMany({
        where: {
          subCategoryId: existing.subCategoryId,
          slug: { startsWith: baseSlug },
          NOT: { id: subjectId },
        },
        select: { slug: true },
      });
      const conflictSlugs = new Set(conflicts.map((s) => s.slug));
      let slug = baseSlug;
      let counter = 1;
      while (conflictSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: updateData,
    });
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { subjectId } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { _count: { select: { topics: true } } },
    });
    if (!subject) throw new NotFoundError("Subject");

    if (subject._count.topics > 0) {
      return errorResponse(
        "SUBJECT_HAS_TOPICS",
        `Tidak bisa menghapus mata pelajaran yang masih memiliki ${subject._count.topics} topik.`,
        409
      );
    }

    await prisma.subject.delete({ where: { id: subjectId } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
