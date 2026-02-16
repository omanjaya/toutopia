import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updatePackageSchema } from "@/shared/lib/validators/package.validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const pkg = await prisma.examPackage.findUnique({
      where: { id },
      include: {
        category: true,
        sections: {
          orderBy: { order: "asc" },
          include: {
            subject: { select: { id: true, name: true } },
            questions: {
              orderBy: { order: "asc" },
              include: {
                question: {
                  select: { id: true, content: true, type: true, difficulty: true },
                },
              },
            },
          },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!pkg) return notFoundResponse("Paket ujian");

    return successResponse(pkg);
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
    const data = updatePackageSchema.parse(body);

    const existing = await prisma.examPackage.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Paket ujian");

    const pkg = await prisma.$transaction(async (tx) => {
      if (data.sections) {
        await tx.examSection.deleteMany({ where: { packageId: id } });
        await tx.examSection.createMany({
          data: data.sections.map((section) => ({
            packageId: id,
            subjectId: section.subjectId,
            title: section.title,
            durationMinutes: section.durationMinutes,
            totalQuestions: section.totalQuestions,
            order: section.order,
          })),
        });
      }

      return tx.examPackage.update({
        where: { id },
        data: {
          categoryId: data.categoryId,
          title: data.title,
          slug: data.slug,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice,
          durationMinutes: data.durationMinutes,
          totalQuestions: data.totalQuestions,
          passingScore: data.passingScore,
          isFree: data.isFree,
          isAntiCheat: data.isAntiCheat,
          maxAttempts: data.maxAttempts,
        },
        include: {
          sections: { orderBy: { order: "asc" } },
        },
      });
    });

    return successResponse(pkg);
  } catch (error) {
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

    const existing = await prisma.examPackage.findUnique({
      where: { id },
      include: { _count: { select: { attempts: true } } },
    });
    if (!existing) return notFoundResponse("Paket ujian");

    if (existing._count.attempts > 0) {
      await prisma.examPackage.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      return successResponse({ archived: true });
    }

    await prisma.examPackage.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
