import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();

    const [userData, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, phone: true, avatar: true },
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
      avatar: userData?.avatar ?? null,
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
  phone: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, "Format nomor telepon tidak valid").nullable().optional(),
  avatar: z.string().url().nullable().optional(),
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

    const { name, phone, avatar, ...profileData } = data;

    const hasUserUpdates = name !== undefined || phone !== undefined || avatar !== undefined;
    const hasProfileUpdates = Object.keys(profileData).some(
      (key) => profileData[key as keyof typeof profileData] !== undefined
    );

    if (!hasUserUpdates && !hasProfileUpdates) {
      return NextResponse.json(
        { success: false, error: { code: "NO_CHANGES", message: "Tidak ada data yang diubah" } },
        { status: 400 }
      );
    }

    const updates: Promise<unknown>[] = [];

    if (name !== undefined || phone !== undefined || avatar !== undefined) {
      updates.push(
        prisma.user.update({
          where: { id: user.id },
          data: {
            ...(name !== undefined && { name }),
            ...(phone !== undefined && { phone }),
            ...(avatar !== undefined && { avatar }),
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
    // Phone number is unique — surface a clear error instead of a generic 500
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("PHONE_TAKEN", "Nomor telepon sudah digunakan", 409);
    }
    return handleApiError(error);
  }
}
