import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { verifyTeacherSchema } from "@/shared/lib/validators/teacher.validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = verifyTeacherSchema.parse(body);

    const profile = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!profile) {
      return errorResponse("NOT_FOUND", "Profil pengajar tidak ditemukan", 404);
    }

    if (data.action === "APPROVE") {
      await prisma.$transaction([
        prisma.teacherProfile.update({
          where: { id },
          data: { isVerified: true, verifiedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: profile.userId },
          data: { role: "TEACHER" },
        }),
      ]);
    } else {
      // Rejected — delete the profile so they can re-apply
      await prisma.teacherProfile.delete({ where: { id } });
    }

    return successResponse({
      action: data.action,
      teacherId: id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
