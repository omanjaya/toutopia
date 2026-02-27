import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkAndAwardBadges } from "@/infrastructure/badge-service";

export async function GET(): Promise<Response> {
  try {
    const user = await requireAuth();

    // Check for new badges on every view
    const newBadges = await checkAndAwardBadges(user.id);

    const allBadges = await prisma.badge.findMany({
      orderBy: [{ category: "asc" }, { xpReward: "asc" }],
      include: {
        users: {
          where: { userId: user.id },
          select: { earnedAt: true },
        },
      },
    });

    const badges = allBadges.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description,
      icon: b.icon,
      category: b.category,
      xpReward: b.xpReward,
      earned: b.users.length > 0,
      earnedAt: b.users[0]?.earnedAt ?? null,
      isNew: newBadges.includes(b.slug),
    }));

    const totalXp = badges
      .filter((b) => b.earned)
      .reduce((sum, b) => sum + b.xpReward, 0);
    const earnedCount = badges.filter((b) => b.earned).length;

    return successResponse({
      badges,
      totalXp,
      earnedCount,
      totalCount: badges.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
