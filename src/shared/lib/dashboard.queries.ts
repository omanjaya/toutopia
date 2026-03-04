import { prisma } from "@/shared/lib/prisma";

// ─── Shared return-type interfaces ───────────────────────────────────────────

export interface RecentAttempt {
  id: string;
  status: string;
  score: number | null;
  startedAt: Date;
  package: { title: string; slug: string };
}

export interface DashboardCoreData {
  /** Total number of COMPLETED attempts that have a non-null score. */
  completedAttempts: number;
  /** Highest score across all completed attempts, rounded. Null if none. */
  bestScore: number | null;
  /** Average score across all completed attempts, rounded. Null if none. */
  avgScore: number | null;
  /** The 5 most-recent attempts (any status). */
  recentAttempts: RecentAttempt[];
  /** Current credit balance (paid credits). */
  creditBalance: number;
  /** Remaining free credits. */
  freeCredits: number;
  /**
   * True when the user has never made a transaction and still has only the
   * initial free-credit allowance (0–2 free credits, 0 or 2 paid balance).
   */
  isNewUser: boolean;
}

// ─── Query ───────────────────────────────────────────────────────────────────

/**
 * Fetches the data that is shared between the desktop and mobile dashboard
 * pages. Both pages call this function; desktop-only data is fetched
 * separately inside the desktop page.
 *
 * This runs all queries concurrently via Promise.all.
 */
export async function getDashboardCoreData(
  userId: string,
): Promise<DashboardCoreData> {
  const [scoreAgg, recentAttempts, credit, transactionCount] =
    await Promise.all([
      prisma.examAttempt.aggregate({
        where: { userId, status: "COMPLETED", score: { not: null } },
        _count: true,
        _max: { score: true },
        _avg: { score: true },
      }),
      prisma.examAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          score: true,
          startedAt: true,
          package: { select: { title: true, slug: true } },
        },
      }),
      prisma.userCredit.findUnique({
        where: { userId },
        select: { balance: true, freeCredits: true },
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

  const creditBalance = credit?.balance ?? 0;
  const freeCredits = credit?.freeCredits ?? 0;
  const isNewUser =
    transactionCount === 0 &&
    (creditBalance === 0 || creditBalance === 2) &&
    freeCredits >= 0 &&
    freeCredits <= 2;

  return {
    completedAttempts: scoreAgg._count,
    bestScore: scoreAgg._max.score ? Math.round(scoreAgg._max.score) : null,
    avgScore: scoreAgg._avg.score ? Math.round(scoreAgg._avg.score) : null,
    recentAttempts,
    creditBalance,
    freeCredits,
    isNewUser,
  };
}
