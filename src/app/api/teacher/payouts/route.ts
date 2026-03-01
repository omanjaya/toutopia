import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireTeacher } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { payoutRequestSchema } from "@/shared/lib/validators/teacher.validators";
import { TEACHER_EARNINGS } from "@/shared/lib/constants";

export async function GET() {
  try {
    const user = await requireTeacher();

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse("NOT_FOUND", "Profil tidak ditemukan", 404);
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { teacherProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return successResponse(payouts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireTeacher();
    const body = await request.json();
    const data = payoutRequestSchema.parse(body);

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse("NOT_FOUND", "Profil tidak ditemukan", 404);
    }

    if (!profile.bankName || !profile.bankAccount || !profile.bankHolder) {
      return errorResponse(
        "NO_BANK_INFO",
        "Lengkapi informasi rekening bank terlebih dahulu",
        400
      );
    }

    if (data.amount < TEACHER_EARNINGS.MIN_PAYOUT_AMOUNT) {
      return errorResponse(
        "MIN_PAYOUT",
        `Minimal penarikan ${TEACHER_EARNINGS.MIN_PAYOUT_AMOUNT.toLocaleString("id-ID")}`,
        400
      );
    }

    // Check existing pending payout (outside transaction — fast early exit)
    const pendingPayout = await prisma.payoutRequest.findFirst({
      where: {
        teacherProfileId: profile.id,
        status: "PENDING",
      },
    });

    if (pendingPayout) {
      return errorResponse(
        "EXISTING_PAYOUT",
        "Masih ada permintaan payout yang belum diproses",
        409
      );
    }

    // Balance check and payout creation are atomic to prevent race conditions
    let payout;
    try {
      payout = await prisma.$transaction(async (tx) => {
        const latestProfile = await tx.teacherProfile.findUnique({
          where: { userId: user.id },
          select: { id: true, totalEarnings: true, bankName: true, bankAccount: true, bankHolder: true },
        });

        if (!latestProfile) {
          throw new Error("PROFILE_NOT_FOUND");
        }

        const paidOut = await tx.payoutRequest.aggregate({
          where: {
            teacherProfileId: latestProfile.id,
            status: { in: ["COMPLETED", "PROCESSING"] },
          },
          _sum: { amount: true },
        });

        const available = latestProfile.totalEarnings - (paidOut._sum.amount ?? 0);

        if (data.amount > available) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        return tx.payoutRequest.create({
          data: {
            teacherProfileId: latestProfile.id,
            amount: data.amount,
            bankName: latestProfile.bankName!,
            bankAccount: latestProfile.bankAccount!,
            bankHolder: latestProfile.bankHolder!,
          },
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
        return errorResponse("INSUFFICIENT_BALANCE", "Saldo tidak mencukupi", 400);
      }
      if (err instanceof Error && err.message === "PROFILE_NOT_FOUND") {
        return errorResponse("NOT_FOUND", "Profil tidak ditemukan", 404);
      }
      throw err;
    }

    return successResponse(payout, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
