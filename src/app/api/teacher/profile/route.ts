import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireTeacher } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { teacherApplicationSchema } from "@/shared/lib/validators/teacher.validators";

export async function GET() {
  try {
    const user = await requireTeacher();

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: { earnings: true, payouts: true },
        },
      },
    });

    if (!profile) {
      return errorResponse("NOT_FOUND", "Profil pengajar tidak ditemukan", 404);
    }

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireTeacher();
    const body = await request.json();
    const data = teacherApplicationSchema.partial().parse(body);

    const profile = await prisma.teacherProfile.update({
      where: { userId: user.id },
      data: {
        education: data.education,
        specialization: data.specialization,
        institution: data.institution,
        bio: data.bio,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        bankHolder: data.bankHolder,
      },
    });

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
