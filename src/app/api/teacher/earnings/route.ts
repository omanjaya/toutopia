import { prisma } from "@/shared/lib/prisma";
import { requireTeacher } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireTeacher();

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse("NOT_FOUND", "Profil pengajar tidak ditemukan", 404);
    }

    const earnings = await prisma.teacherEarning.findMany({
      where: { teacherProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        question: {
          select: { content: true },
        },
      },
    });

    const totalEarnings = profile.totalEarnings;

    // Calculate withdrawable amount (total earnings minus already paid out)
    const paidOut = await prisma.payoutRequest.aggregate({
      where: {
        teacherProfileId: profile.id,
        status: { in: ["COMPLETED", "PROCESSING"] },
      },
      _sum: { amount: true },
    });

    const pendingPayout = await prisma.payoutRequest.aggregate({
      where: {
        teacherProfileId: profile.id,
        status: "PENDING",
      },
      _sum: { amount: true },
    });

    const withdrawable =
      totalEarnings -
      (paidOut._sum.amount ?? 0) -
      (pendingPayout._sum.amount ?? 0);

    return successResponse({
      totalEarnings,
      paidOut: paidOut._sum.amount ?? 0,
      pendingPayout: pendingPayout._sum.amount ?? 0,
      withdrawable: Math.max(0, withdrawable),
      earnings: earnings.map((e) => ({
        id: e.id,
        questionPreview: e.question.content.replace(/<[^>]*>/g, "").substring(0, 60),
        amount: e.amount,
        attemptCount: e.attemptCount,
        period: e.period,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
