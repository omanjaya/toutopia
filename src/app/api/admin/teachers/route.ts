import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    await requireAdmin();

    const teachers = await prisma.teacherProfile.findMany({
      orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { earnings: true, payouts: true },
        },
      },
    });

    return successResponse(teachers);
  } catch (error) {
    return handleApiError(error);
  }
}
