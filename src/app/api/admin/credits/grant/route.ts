import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const grantSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().positive("Jumlah harus positif"),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = grantSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User tidak ditemukan", 404);
    }

    await prisma.$transaction([
      prisma.userCredit.upsert({
        where: { userId: data.userId },
        update: { balance: { increment: data.amount } },
        create: {
          userId: data.userId,
          balance: data.amount,
        },
      }),
      prisma.creditHistory.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          type: "BONUS",
          description: data.description ?? "Manual grant oleh admin",
        },
      }),
    ]);

    return successResponse({ granted: true, amount: data.amount });
  } catch (error) {
    return handleApiError(error);
  }
}
