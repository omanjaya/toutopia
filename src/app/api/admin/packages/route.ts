import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createPackageSchema } from "@/shared/lib/validators/package.validators";

export async function GET() {
  try {
    await requireAdmin();

    const packages = await prisma.examPackage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        category: { select: { name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            subject: { select: { name: true } },
            _count: { select: { questions: true } },
          },
        },
        _count: { select: { attempts: true } },
      },
    });

    return successResponse(packages);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const data = createPackageSchema.parse(body);

    const pkg = await prisma.$transaction(async (tx) => {
      const created = await tx.examPackage.create({
        data: {
          categoryId: data.categoryId,
          title: data.title,
          slug: data.slug,
          description: data.description ?? null,
          price: data.price,
          discountPrice: data.discountPrice ?? null,
          durationMinutes: data.durationMinutes,
          totalQuestions: data.totalQuestions,
          passingScore: data.passingScore ?? null,
          isFree: data.isFree,
          isAntiCheat: data.isAntiCheat,
          maxAttempts: data.maxAttempts,
          createdById: user.id,
        },
      });

      if (data.sections.length > 0) {
        await tx.examSection.createMany({
          data: data.sections.map((section) => ({
            packageId: created.id,
            subjectId: section.subjectId,
            title: section.title,
            durationMinutes: section.durationMinutes,
            totalQuestions: section.totalQuestions,
            order: section.order,
          })),
        });
      }

      return tx.examPackage.findUnique({
        where: { id: created.id },
        include: {
          sections: { orderBy: { order: "asc" } },
        },
      });
    });

    return successResponse(pkg, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
