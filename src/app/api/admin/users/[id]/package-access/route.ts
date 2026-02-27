import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { grantPackageAccessSchema } from "@/shared/lib/validators/admin-user.validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const data = grantPackageAccessSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User tidak ditemukan", 404);
    }

    const pkg = await prisma.examPackage.findUnique({
      where: { id: data.packageId },
      select: { id: true },
    });

    if (!pkg) {
      return errorResponse("NOT_FOUND", "Paket ujian tidak ditemukan", 404);
    }

    const existing = await prisma.userPackageAccess.findUnique({
      where: {
        userId_packageId: { userId: id, packageId: data.packageId },
      },
    });

    if (existing) {
      return errorResponse(
        "CONFLICT",
        "User sudah memiliki akses ke paket ini",
        409
      );
    }

    const access = await prisma.userPackageAccess.create({
      data: {
        userId: id,
        packageId: data.packageId,
        grantedBy: admin.id,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        reason: data.reason,
      },
      select: {
        id: true,
        grantedAt: true,
        expiresAt: true,
        reason: true,
        package: { select: { id: true, title: true } },
      },
    });

    return successResponse(access, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

const revokeSchema = z.object({
  accessId: z.string().min(1),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { accessId } = revokeSchema.parse(body);

    const access = await prisma.userPackageAccess.findFirst({
      where: { id: accessId, userId: id },
    });

    if (!access) {
      return errorResponse("NOT_FOUND", "Akses tidak ditemukan", 404);
    }

    await prisma.userPackageAccess.delete({
      where: { id: accessId },
    });

    return successResponse({ revoked: true });
  } catch (error) {
    return handleApiError(error);
  }
}
