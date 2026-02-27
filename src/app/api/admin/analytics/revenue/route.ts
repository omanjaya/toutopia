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

    const transactions = await prisma.transaction.findMany({
      where: {
        status: "PAID",
        paidAt: { gte: startDate },
      },
      select: {
        amount: true,
        paidAt: true,
        paymentMethod: true,
      },
      orderBy: { paidAt: "asc" },
    });

    // Group by date
    const dailyMap = new Map<string, { amount: number; count: number }>();
    const methodMap = new Map<string, number>();

    for (const tx of transactions) {
      const dateKey = tx.paidAt!.toISOString().slice(0, 10);
      const entry = dailyMap.get(dateKey) ?? { amount: 0, count: 0 };
      entry.amount += tx.amount;
      entry.count += 1;
      dailyMap.set(dateKey, entry);

      const method = tx.paymentMethod ?? "OTHER";
      methodMap.set(method, (methodMap.get(method) ?? 0) + tx.amount);
    }

    const daily = [...dailyMap.entries()].map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }));

    const byMethod = [...methodMap.entries()]
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount);

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTransactions = transactions.length;

    return successResponse({
      period: { days, from: startDate.toISOString(), to: new Date().toISOString() },
      totalRevenue,
      totalTransactions,
      daily,
      byMethod,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
