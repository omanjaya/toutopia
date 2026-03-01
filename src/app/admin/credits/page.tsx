import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { Gift, TrendingUp, Users, Coins } from "lucide-react";
import { CreditsTable } from "./credits-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Kredit — Admin",
  description: "Kelola saldo kredit pengguna",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const ITEMS_PER_PAGE = 30;

interface Props {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminCreditsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const sort = params.sort ?? "balance_desc";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

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

  const [credits, total, aggregates, usersWithCreditsCount] = await Promise.all([
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
    prisma.userCredit.aggregate({
      _sum: { balance: true, freeCredits: true },
      _avg: { balance: true },
    }),
    prisma.userCredit.count({ where: { balance: { gt: 0 } } }),
  ]);

  // Fetch history counts for the current page users
  const userIds = credits.map((c) => c.userId);
  const historyCounts = await prisma.creditHistory.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds } },
    _count: { id: true },
  });
  const historyCountMap = new Map(historyCounts.map((h) => [h.userId, h._count.id]));

  const initialData = credits.map((c) => ({
    ...c,
    updatedAt: c.updatedAt.toISOString(),
    historyCount: historyCountMap.get(c.userId) ?? 0,
  }));

  const totalCreditsInCirculation =
    (aggregates._sum.balance ?? 0) + (aggregates._sum.freeCredits ?? 0);
  const avgBalance = Math.round(aggregates._avg.balance ?? 0);
  const totalUserCount = await prisma.userCredit.count();

  const statCards = [
    {
      title: "Pengguna dengan Kredit",
      value: usersWithCreditsCount.toLocaleString("id-ID"),
      sub: `dari ${totalUserCount.toLocaleString("id-ID")} total`,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Kredit Beredar",
      value: totalCreditsInCirculation.toLocaleString("id-ID"),
      sub: "balance + free credits",
      icon: Coins,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Rata-rata Saldo",
      value: avgBalance.toLocaleString("id-ID"),
      sub: "per pengguna aktif",
      icon: TrendingUp,
      color: "bg-violet-500/10 text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Manajemen Kredit</h2>
          <p className="text-sm text-muted-foreground">Kelola saldo kredit pengguna</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.title} className={cardCls}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Credits Table (client component with search/sort/pagination) */}
      <CreditsTable
        initialData={initialData}
        initialTotal={total}
        initialPage={page}
      />
    </div>
  );
}
