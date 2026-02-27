import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updateThemeSchema } from "@/shared/lib/validators/user.validators";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { theme } = updateThemeSchema.parse(body);

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: { theme },
      create: { userId: user.id, theme },
      select: { theme: true },
    });

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
