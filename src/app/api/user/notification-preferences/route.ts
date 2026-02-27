import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const updateSchema = z.object({
  notifyExamResult: z.boolean().optional(),
  notifyPayment: z.boolean().optional(),
  notifyPromo: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: {
        notifyExamResult: true,
        notifyPayment: true,
        notifyPromo: true,
        notifyPush: true,
      },
    });

    return successResponse(profile ?? {
      notifyExamResult: true,
      notifyPayment: true,
      notifyPromo: true,
      notifyPush: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = updateSchema.parse(body);

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
      select: {
        notifyExamResult: true,
        notifyPayment: true,
        notifyPromo: true,
        notifyPush: true,
      },
    });

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
