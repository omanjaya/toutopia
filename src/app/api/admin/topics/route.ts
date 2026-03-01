import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const createTopicSchema = z.object({
  name: z.string().min(1, "Nama topik wajib diisi").max(120),
  subjectId: z.string().min(1, "Mata pelajaran wajib dipilih"),
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

export async function GET() {
  try {
    await requireAdmin();

    const subjects = await prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: {
        subCategory: { include: { category: { select: { name: true } } } },
        topics: {
          orderBy: { order: "asc" },
          include: { _count: { select: { questions: true } } },
        },
      },
    });

    return successResponse(subjects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body: unknown = await request.json();
    const { name, subjectId, order } = createTopicSchema.parse(body);

    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return errorResponse("NOT_FOUND", "Mata pelajaran tidak ditemukan", 404);
    }

    // Auto-increment order if not provided
    let finalOrder = order;
    if (finalOrder === undefined) {
      const last = await prisma.topic.findFirst({
        where: { subjectId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      finalOrder = (last?.order ?? -1) + 1;
    }

    // Generate unique slug
    const baseSlug = toSlug(name);
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await prisma.topic.findUnique({
        where: { subjectId_slug: { subjectId, slug } },
      });
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const topic = await prisma.topic.create({
      data: { name, subjectId, slug, order: finalOrder },
      include: { _count: { select: { questions: true } } },
    });

    return successResponse(topic, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
