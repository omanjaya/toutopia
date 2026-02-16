import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    await requireAdmin();

    const payouts = await prisma.payoutRequest.findMany({
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        teacherProfile: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    return successResponse(payouts);
  } catch (error) {
    return handleApiError(error);
  }
}
