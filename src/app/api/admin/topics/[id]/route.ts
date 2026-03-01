import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const patchTopicSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  order: z.number().int().min(0).optional(),
});

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body: unknown = await request.json();
    const updates = patchTopicSchema.parse(body);

    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      return notFoundResponse("Topik");
    }

    const data: { name?: string; order?: number; slug?: string } = {};

    if (updates.name !== undefined) {
      data.name = updates.name;

      // Re-generate unique slug for new name
      const baseSlug = toSlug(updates.name);
      let slug = baseSlug;
      let attempt = 0;
      while (true) {
        const existing = await prisma.topic.findUnique({
          where: { subjectId_slug: { subjectId: topic.subjectId, slug } },
        });
        // Allow if not found, or if it's the same topic being updated
        if (!existing || existing.id === id) break;
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }
      data.slug = slug;
    }

    if (updates.order !== undefined) {
      data.order = updates.order;
    }

    const updated = await prisma.topic.update({
      where: { id },
      data,
      include: { _count: { select: { questions: true } } },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });

    if (!topic) {
      return notFoundResponse("Topik");
    }

    if (topic._count.questions > 0) {
      return errorResponse(
        "TOPIC_HAS_QUESTIONS",
        `Topik ini memiliki ${topic._count.questions} soal. Hapus atau pindahkan soal terlebih dahulu.`,
        409
      );
    }

    await prisma.topic.delete({ where: { id } });

    return successResponse({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
