import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateUserRoleSchema } from "@/shared/lib/validators/admin-user.validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { role } = updateUserRoleSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return errorResponse("NOT_FOUND", "User tidak ditemukan", 404);
    }

    if (role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return errorResponse(
        "FORBIDDEN",
        "Hanya SUPER_ADMIN yang bisa menetapkan role SUPER_ADMIN",
        403
      );
    }

    if (targetUser.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return errorResponse(
        "FORBIDDEN",
        "Tidak bisa mengubah role SUPER_ADMIN",
        403
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
