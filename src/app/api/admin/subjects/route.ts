import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  subCategoryId: z.string().min(1),
  order: z.number().int().min(0).optional().default(0),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
    const subjects = await prisma.subject.findMany({
      include: {
        subCategory: { include: { category: true } },
        _count: { select: { topics: true } },
      },
      orderBy: { order: "asc" },
    });
    return successResponse(subjects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    await requireAdmin();
    const body: unknown = await req.json();
    const data = createSubjectSchema.parse(body);

    const baseSlug = slugify(data.name);
    // Ensure slug uniqueness within the subCategory
    const existing = await prisma.subject.findMany({
      where: { subCategoryId: data.subCategoryId, slug: { startsWith: baseSlug } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((s) => s.slug));
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        subCategoryId: data.subCategoryId,
        slug,
        order: data.order,
      },
    });
    return successResponse(subject);
  } catch (error) {
    return handleApiError(error);
  }
}
