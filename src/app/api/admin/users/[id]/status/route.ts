import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateUserStatusSchema } from "@/shared/lib/validators/admin-user.validators";
import { logAudit } from "@/shared/lib/audit-log";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { status } = updateUserStatusSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true },
    });

    if (!targetUser) {
      return errorResponse("NOT_FOUND", "User tidak ditemukan", 404);
    }

    if (targetUser.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return errorResponse(
        "FORBIDDEN",
        "Tidak bisa mengubah status SUPER_ADMIN",
        403
      );
    }

    const oldStatus = targetUser.status;
    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    logAudit({
      userId: admin.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      oldData: { status: oldStatus },
      newData: { status },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
