import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// POST /api/subscriptions/[subscriptionId]/cancel
// Allows an authenticated user to cancel their own active subscription.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
): Promise<Response> {
  try {
    const user = await requireAuth();
    const { subscriptionId } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Langganan tidak ditemukan", 404);
    }

    if (subscription.status !== "ACTIVE") {
      return errorResponse(
        "INVALID_STATUS",
        "Langganan sudah tidak aktif",
        400
      );
    }

    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: "CANCELLED" },
      });

      await tx.userPackageAccess.deleteMany({
        where: {
          userId: user.id,
          grantedBy: "SUBSCRIPTION",
        },
      });
    });

    return successResponse({ message: "Langganan berhasil dibatalkan" });
  } catch (error) {
    return handleApiError(error);
  }
}
