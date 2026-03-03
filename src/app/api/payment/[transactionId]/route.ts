import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const user = await requireAuth();
    const { transactionId } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        package: { select: { title: true } },
      },
    });

    if (!transaction || transaction.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Transaksi tidak ditemukan", 404);
    }

    const data: Record<string, unknown> = {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      packageTitle: transaction.package?.title ?? null,
      paidAt: transaction.paidAt?.toISOString() ?? null,
      createdAt: transaction.createdAt.toISOString(),
    };

    if (transaction.status === "PENDING") {
      data.snapToken = transaction.snapToken ?? null;
      data.midtransUrl = transaction.midtransUrl ?? null;
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
