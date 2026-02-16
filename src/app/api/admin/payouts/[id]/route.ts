import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const updatePayoutSchema = z.object({
  status: z.enum(["PROCESSING", "COMPLETED", "REJECTED"]),
  rejectionReason: z.string().nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updatePayoutSchema.parse(body);

    const payout = await prisma.payoutRequest.findUnique({
      where: { id },
    });

    if (!payout) {
      return errorResponse("NOT_FOUND", "Payout tidak ditemukan", 404);
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ["PROCESSING", "REJECTED"],
      PROCESSING: ["COMPLETED", "REJECTED"],
    };

    const allowed = validTransitions[payout.status];
    if (!allowed || !allowed.includes(data.status)) {
      return errorResponse(
        "INVALID_TRANSITION",
        `Tidak dapat mengubah status dari ${payout.status} ke ${data.status}`,
        400
      );
    }

    const updated = await prisma.payoutRequest.update({
      where: { id },
      data: {
        status: data.status,
        rejectionReason: data.status === "REJECTED" ? (data.rejectionReason ?? null) : undefined,
        processedAt: data.status === "COMPLETED" || data.status === "PROCESSING" ? new Date() : undefined,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
