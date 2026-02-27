import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { completeOnboardingSchema } from "@/shared/lib/validators/user.validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = completeOnboardingSchema.parse(body);

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        onboardingCompleted: true,
        ...(data.theme && { theme: data.theme }),
        ...(data.targetExam && { targetExam: data.targetExam }),
      },
      create: {
        userId: user.id,
        onboardingCompleted: true,
        theme: data.theme ?? "DEFAULT",
        targetExam: data.targetExam ?? null,
      },
      select: { theme: true, onboardingCompleted: true },
    });

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
