import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const seriesSchema = z.object({
  seriesName: z.string().min(2),
  count: z.number().int().min(2).max(20),
  examType: z.enum(["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"]),
  categoryId: z.string().min(1),
  price: z.number().int().min(0),
  discountPrice: z.number().int().min(0).optional().nullable(),
  isFree: z.boolean(),
  isAntiCheat: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).default(1),
  passingScore: z.number().int().optional().nullable(),
  jabatan: z.string().optional(),
  sections: z
    .array(
      z.object({
        subjectId: z.string().min(1),
        title: z.string().min(1),
        durationMinutes: z.number().int().min(1),
        totalQuestions: z.number().int().min(1),
        order: z.number().int().min(0),
      })
    )
    .min(1),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const data = seriesSchema.parse(body);

    // Verify category exists
    const category = await prisma.examCategory.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });

    if (!category) return notFoundResponse("Kategori");

    // Verify all subjectIds exist
    const subjectIds = [...new Set(data.sections.map((s) => s.subjectId))];
    const subjectCount = await prisma.subject.count({
      where: { id: { in: subjectIds } },
    });

    if (subjectCount !== subjectIds.length) {
      return errorResponse(
        "SUBJECT_NOT_FOUND",
        "Satu atau lebih subject tidak ditemukan",
        400
      );
    }

    const durationMinutes = data.sections.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalQuestions = data.sections.reduce((sum, s) => sum + s.totalQuestions, 0);

    // Check for slug conflicts before creating
    const slugsToCheck = Array.from({ length: data.count }, (_, i) =>
      slugify(`paket-${data.seriesName}-${i + 1}`)
    );

    const existingSlugs = await prisma.examPackage.findMany({
      where: { slug: { in: slugsToCheck } },
      select: { slug: true },
    });

    if (existingSlugs.length > 0) {
      return errorResponse(
        "SLUG_CONFLICT",
        `Paket dengan slug berikut sudah ada: ${existingSlugs.map((p) => p.slug).join(", ")}`,
        409
      );
    }

    // Create all packages in a transaction
    const created = await prisma.$transaction(
      Array.from({ length: data.count }, (_, i) => {
        const title = `Paket ${data.seriesName} ${i + 1}`;
        const slug = slugify(`paket-${data.seriesName}-${i + 1}`);

        return prisma.examPackage.create({
          data: {
            categoryId: data.categoryId,
            title,
            slug,
            price: data.price,
            discountPrice: data.discountPrice ?? null,
            isFree: data.isFree,
            isAntiCheat: data.isAntiCheat,
            maxAttempts: data.maxAttempts,
            passingScore: data.passingScore ?? null,
            durationMinutes,
            totalQuestions,
            status: "DRAFT",
            createdById: user.id,
            sections: {
              create: data.sections.map((s) => ({
                subjectId: s.subjectId,
                title: s.title,
                durationMinutes: s.durationMinutes,
                totalQuestions: s.totalQuestions,
                order: s.order,
              })),
            },
          },
          select: {
            id: true,
            title: true,
            slug: true,
          },
        });
      })
    );

    return successResponse(
      {
        packages: created,
        count: created.length,
        seriesName: data.seriesName,
      },
      undefined,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
