import { prisma } from "@/shared/lib/prisma";
import { requireRole } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);

    const searchParams = request.nextUrl.searchParams;
    const days = Math.min(Math.max(parseInt(searchParams.get("days") ?? "30") || 30, 1), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // New registrations per day
    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyRegistrations = new Map<string, number>();
    for (const user of newUsers) {
      const dateKey = user.createdAt.toISOString().slice(0, 10);
      dailyRegistrations.set(dateKey, (dailyRegistrations.get(dateKey) ?? 0) + 1);
    }

    // Active users (users who completed at least 1 exam in period)
    const activeUserCount = await prisma.examAttempt.groupBy({
      by: ["userId"],
      where: {
        status: "COMPLETED",
        finishedAt: { gte: startDate },
      },
    });

    // Role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Total users
    const totalUsers = await prisma.user.count();
    const newUsersCount = newUsers.length;

    return successResponse({
      period: { days, from: startDate.toISOString(), to: new Date().toISOString() },
      totalUsers,
      newUsersInPeriod: newUsersCount,
      activeUsersInPeriod: activeUserCount.length,
      dailyRegistrations: [...dailyRegistrations.entries()].map(([date, count]) => ({
        date,
        count,
      })),
      roleDistribution: roleDistribution.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
