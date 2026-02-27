import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const user = await requireAuth();
    const { packageId } = await params;

    const pkg = await prisma.examPackage.findUnique({
      where: { id: packageId },
      select: { id: true, title: true },
    });

    if (!pkg) {
      return errorResponse("NOT_FOUND", "Paket tidak ditemukan", 404);
    }

    const entries = await prisma.leaderboardEntry.findMany({
      where: { packageId },
      orderBy: { score: "desc" },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        attempt: {
          select: { finishedAt: true, totalCorrect: true },
        },
      },
    });

    const ranked = entries.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.user.id,
      name: entry.user.name ?? "Anonim",
      avatar: entry.user.avatar,
      score: Math.round(entry.score),
      totalCorrect: entry.attempt.totalCorrect,
      finishedAt: entry.attempt.finishedAt?.toISOString() ?? null,
      isCurrentUser: entry.user.id === user.id,
    }));

    const currentUserEntry = ranked.find((r) => r.isCurrentUser);

    let currentUserRank = currentUserEntry?.rank ?? null;

    if (!currentUserEntry) {
      const userEntry = await prisma.leaderboardEntry.findUnique({
        where: {
          packageId_userId: { packageId, userId: user.id },
        },
        select: { score: true },
      });

      if (userEntry) {
        const higherCount = await prisma.leaderboardEntry.count({
          where: {
            packageId,
            score: { gt: userEntry.score },
          },
        });
        currentUserRank = higherCount + 1;
      }
    }

    return successResponse({
      packageTitle: pkg.title,
      entries: ranked,
      currentUserRank,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
