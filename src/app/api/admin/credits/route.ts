import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const ITEMS_PER_PAGE = 30;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const sort = searchParams.get("sort") ?? "balance_desc";

    type OrderByOption =
      | { balance: "asc" | "desc" }
      | { updatedAt: "desc" };

    const orderByMap: Record<string, OrderByOption> = {
      balance_desc: { balance: "desc" },
      balance_asc: { balance: "asc" },
      newest: { updatedAt: "desc" },
    };
    const orderBy = orderByMap[sort] ?? orderByMap.balance_desc;

    const userWhere = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [credits, total] = await Promise.all([
      prisma.userCredit.findMany({
        where: { user: userWhere },
        orderBy,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: {
          id: true,
          userId: true,
          balance: true,
          freeCredits: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.userCredit.count({ where: { user: userWhere } }),
    ]);

    // Fetch credit history counts separately
    const userIds = credits.map((c) => c.userId);
    const historyCounts = await prisma.creditHistory.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _count: { id: true },
    });
    const historyCountMap = new Map(historyCounts.map((h) => [h.userId, h._count.id]));

    const data = credits.map((c) => ({
      ...c,
      historyCount: historyCountMap.get(c.userId) ?? 0,
    }));

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return successResponse(data, {
      page,
      total,
      totalPages,
      limit: ITEMS_PER_PAGE,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
