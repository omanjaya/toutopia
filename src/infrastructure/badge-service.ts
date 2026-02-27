import { prisma } from "@/shared/lib/prisma";

interface BadgeRequirement {
  type: string;
  value: number;
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  // Get all badges not yet earned by user
  const unearnedBadges = await prisma.badge.findMany({
    where: {
      NOT: {
        users: { some: { userId } },
      },
    },
  });

  if (unearnedBadges.length === 0) return [];

  // Fetch user stats in parallel
  const [examCount, bestScoreResult, profile, categoryCount, referralCount, latestAttempt] = await Promise.all([
    prisma.examAttempt.count({ where: { userId, status: "COMPLETED" } }),
    prisma.examAttempt.aggregate({
      where: { userId, status: "COMPLETED" },
      _max: { score: true },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      select: { currentStreak: true, longestStreak: true },
    }),
    prisma.examAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      select: { package: { select: { categoryId: true } } },
      distinct: ["packageId"],
    }).then((attempts) => new Set(attempts.map((a) => a.package.categoryId)).size),
    prisma.user.count({ where: { referredById: userId } }),
    prisma.examAttempt.findFirst({
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
    const req = badge.requirement as unknown as BadgeRequirement;
    let earned = false;

    switch (req.type) {
      case "exam_count":
        earned = examCount >= req.value;
        break;
      case "best_score":
        earned = bestScore >= req.value;
        break;
      case "streak":
        earned = streak >= req.value;
        break;
      case "category_count":
        earned = categoryCount >= req.value;
        break;
      case "referral_count":
        earned = referralCount >= req.value;
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
    await prisma.userBadge.createMany({
      data: badgesToAward.map((b) => ({ userId, badgeId: b.id })),
      skipDuplicates: true,
    });
  }

  return earnedSlugs;
}
