import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { teacherApplicationSchema } from "@/shared/lib/validators/teacher.validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = teacherApplicationSchema.parse(body);

    // Check if already applied
    const existing = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return errorResponse(
        "ALREADY_APPLIED",
        existing.isVerified
          ? "Anda sudah terdaftar sebagai pengajar"
          : "Pengajuan Anda sedang diproses",
        409
      );
    }

    const profile = await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        education: data.education,
        specialization: data.specialization,
        institution: data.institution ?? null,
        bio: data.bio,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        bankHolder: data.bankHolder,
      },
    });

    return successResponse(profile, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
