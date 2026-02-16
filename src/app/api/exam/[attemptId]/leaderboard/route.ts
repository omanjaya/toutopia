import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireAuth();
    const { attemptId } = await params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { packageId: true, userId: true },
    });

    if (!attempt || attempt.userId !== user.id) {
      return errorResponse("NOT_FOUND", "Tidak ditemukan", 404);
    }

    const entries = await prisma.leaderboardEntry.findMany({
      where: { packageId: attempt.packageId },
      orderBy: { score: "desc" },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const ranked = entries.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.user.id,
      name: entry.user.name ?? "Anonim",
      avatar: entry.user.avatar,
      score: Math.round(entry.score),
      isCurrentUser: entry.user.id === user.id,
    }));

    return successResponse(ranked);
  } catch (error) {
    return handleApiError(error);
  }
}
