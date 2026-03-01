import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const original = await prisma.examPackage.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            questions: {
              orderBy: { order: "asc" },
              select: { questionId: true, order: true },
            },
          },
        },
      },
    });

    if (!original) return notFoundResponse("Paket ujian");

    // Generate unique slug
    const baseSlug = `${original.slug}-salinan`;
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.examPackage.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const cloned = await prisma.$transaction(async (tx) => {
      const newPkg = await tx.examPackage.create({
        data: {
          categoryId: original.categoryId,
          title: `${original.title} (Salinan)`,
          slug,
          description: original.description,
          price: original.price,
          discountPrice: original.discountPrice,
          durationMinutes: original.durationMinutes,
          totalQuestions: original.totalQuestions,
          passingScore: original.passingScore,
          isFree: original.isFree,
          isAntiCheat: original.isAntiCheat,
          maxAttempts: original.maxAttempts,
          createdById: user.id,
          status: "DRAFT",
        },
      });

      for (const section of original.sections) {
        const newSection = await tx.examSection.create({
          data: {
            packageId: newPkg.id,
            subjectId: section.subjectId,
            title: section.title,
            durationMinutes: section.durationMinutes,
            totalQuestions: section.totalQuestions,
            order: section.order,
          },
        });

        if (section.questions.length > 0) {
          await tx.examSectionQuestion.createMany({
            data: section.questions.map((q) => ({
              sectionId: newSection.id,
              questionId: q.questionId,
              order: q.order,
            })),
          });
        }
      }

      return newPkg;
    });

    return successResponse({ id: cloned.id, title: cloned.title }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
