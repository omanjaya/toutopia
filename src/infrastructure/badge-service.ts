import { prisma } from "@/shared/lib/prisma";

interface BadgeRequirement {
  type: string;
  value: number;
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  return prisma.$transaction(async (tx) => {
    // Get all badges not yet earned by user
    const unearnedBadges = await tx.badge.findMany({
      where: {
        NOT: {
          users: { some: { userId } },
        },
      },
    });

    if (unearnedBadges.length === 0) return [];

    // Fetch user stats in parallel
    const [examCount, bestScoreResult, profile, categoryCount, referralCount, latestAttempt] = await Promise.all([
      tx.examAttempt.count({ where: { userId, status: "COMPLETED" } }),
      tx.examAttempt.aggregate({
        where: { userId, status: "COMPLETED" },
        _max: { score: true },
      }),
      tx.userProfile.findUnique({
        where: { userId },
        select: { currentStreak: true, longestStreak: true },
      }),
      tx.examAttempt.findMany({
        where: { userId, status: "COMPLETED" },
        select: { package: { select: { categoryId: true } } },
        distinct: ["packageId"],
      }).then((attempts) => new Set(attempts.map((a) => a.package.categoryId)).size),
      tx.user.count({ where: { referredById: userId } }),
      tx.examAttempt.findFirst({
        where: { userId, status: "COMPLETED" },
        orderBy: { finishedAt: "desc" },
        select: {
          score: true,
          totalCorrect: true,
          totalUnanswered: true,
          totalIncorrect: true,
          startedAt: true,
          finishedAt: true,
          package: { select: { durationMinutes: true, totalQuestions: true } },
        },
      }),
    ]);

    const bestScore = bestScoreResult._max.score ?? 0;
    const streak = Math.max(profile?.currentStreak ?? 0, profile?.longestStreak ?? 0);

    const earnedSlugs: string[] = [];

    for (const badge of unearnedBadges) {
      // Runtime validation before using the requirement object
      const req = badge.requirement as unknown;
      if (!req || typeof req !== "object") continue;
      const reqObj = req as Record<string, unknown>;
      if (typeof reqObj.type !== "string" || typeof reqObj.value !== "number") continue;

      let earned = false;

      switch (reqObj.type) {
        case "exam_count":
          earned = examCount >= reqObj.value;
          break;
        case "best_score":
          earned = bestScore >= reqObj.value;
          break;
        case "streak":
          earned = streak >= reqObj.value;
          break;
        case "category_count":
          earned = categoryCount >= reqObj.value;
          break;
        case "referral_count":
          earned = referralCount >= reqObj.value;
          break;
        case "all_correct":
          if (latestAttempt) {
            earned =
              latestAttempt.totalIncorrect === 0 &&
              latestAttempt.totalUnanswered === 0 &&
              (latestAttempt.totalCorrect ?? 0) > 0;
          }
          break;
        case "speed":
          if (latestAttempt?.startedAt && latestAttempt?.finishedAt) {
            const durationMs =
              new Date(latestAttempt.finishedAt).getTime() -
              new Date(latestAttempt.startedAt).getTime();
            const durationMinutes = durationMs / 60000;
            const halfTime = latestAttempt.package.durationMinutes / 2;
            earned = durationMinutes < halfTime;
          }
          break;
      }

      if (earned) {
        earnedSlugs.push(badge.slug);
      }
    }

    // Award badges in bulk
    if (earnedSlugs.length > 0) {
      const badgesToAward = unearnedBadges.filter((b) => earnedSlugs.includes(b.slug));
      await tx.userBadge.createMany({
        data: badgesToAward.map((b) => ({ userId, badgeId: b.id })),
        skipDuplicates: true,
      });
    }

    return earnedSlugs;
  });
}
