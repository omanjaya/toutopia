import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TOU-${code}`;
}

export async function GET() {
  try {
    const user = await requireAuth();

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        referralCode: true,
        _count: { select: { referrals: true } },
      },
    });

    if (!dbUser) {
      return handleApiError(new Error("User not found"));
    }

    if (!dbUser.referralCode) {
      let code = generateCode();
      let attempts = 0;
      while (attempts < 5) {
        const exists = await prisma.user.findUnique({
          where: { referralCode: code },
          select: { id: true },
        });
        if (!exists) break;
        code = generateCode();
        attempts++;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code },
      });

      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          referralCode: true,
          _count: { select: { referrals: true } },
        },
      });
    }

    return successResponse({
      referralCode: dbUser!.referralCode,
      totalReferrals: dbUser!._count.referrals,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
