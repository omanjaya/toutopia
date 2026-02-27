import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();

    const [userData, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, phone: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: {
          theme: true,
          onboardingCompleted: true,
          school: true,
          city: true,
          targetExam: true,
          bio: true,
        },
      }),
    ]);

    return successResponse({
      name: userData?.name ?? "",
      phone: userData?.phone ?? null,
      theme: profile?.theme ?? "DEFAULT",
      onboardingCompleted: profile?.onboardingCompleted ?? false,
      school: profile?.school ?? null,
      city: profile?.city ?? null,
      targetExam: profile?.targetExam ?? null,
      bio: profile?.bio ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).nullable().optional(),
  school: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  targetExam: z.string().max(100).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const { name, phone, ...profileData } = data;

    const updates: Promise<unknown>[] = [];

    if (name !== undefined || phone !== undefined) {
      updates.push(
        prisma.user.update({
          where: { id: user.id },
          data: {
            ...(name !== undefined && { name }),
            ...(phone !== undefined && { phone }),
          },
        })
      );
    }

    if (Object.keys(profileData).length > 0) {
      updates.push(
        prisma.userProfile.upsert({
          where: { userId: user.id },
          update: profileData,
          create: { userId: user.id, ...profileData },
        })
      );
    }

    await Promise.all(updates);

    return successResponse({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
