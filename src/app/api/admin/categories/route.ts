import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    await requireAuth();

    const categories = await prisma.examCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        subCategories: {
          orderBy: { order: "asc" },
          include: {
            subjects: {
              orderBy: { order: "asc" },
              include: {
                topics: { orderBy: { order: "asc" } },
              },
            },
          },
        },
      },
    });

    return successResponse(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
