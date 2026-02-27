import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    await requireAdmin();

    // Basic counts
    const [userCount, packageCount, questionCount, attemptCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.examPackage.count({ where: { status: "PUBLISHED" } }),
        prisma.question.count({ where: { status: "APPROVED" } }),
        prisma.examAttempt.count({ where: { status: "COMPLETED" } }),
      ]);

    // Revenue
    const revenueResult = await prisma.transaction.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    });

    const totalRevenue = revenueResult._sum.amount ?? 0;
    const paidTransactions = revenueResult._count;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        status: "PAID",
        paidAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: "asc" },
      take: 10000,
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const tx of recentTransactions) {
      if (!tx.paidAt) continue;
      const key = `${tx.paidAt.getFullYear()}-${String(tx.paidAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + tx.amount;
    }

    const revenueChart = Object.entries(monthlyRevenue).map(
      ([month, amount]) => ({
        month,
        amount,
      })
    );

    // User growth (last 6 months)
    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 10000,
    });

    const monthlyUsers: Record<string, number> = {};
    for (const u of recentUsers) {
      const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyUsers[key] = (monthlyUsers[key] ?? 0) + 1;
    }

    const userGrowthChart = Object.entries(monthlyUsers).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    // Popular packages (top 10)
    const popularPackages = await prisma.examPackage.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { attempts: { _count: "desc" } },
      take: 10,
    });

    // Recent transactions
    const latestTransactions = await prisma.transaction.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 5,
      select: {
        id: true,
        amount: true,
        paidAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    return successResponse({
      counts: { userCount, packageCount, questionCount, attemptCount },
      revenue: {
        total: totalRevenue,
        paidTransactions,
        chart: revenueChart,
      },
      userGrowth: userGrowthChart,
      popularPackages: popularPackages.map((p) => ({
        id: p.id,
        title: p.title,
        attempts: p._count.attempts,
      })),
      latestTransactions: latestTransactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        paidAt: t.paidAt?.toISOString() ?? null,
        userName: t.user.name ?? t.user.email,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
