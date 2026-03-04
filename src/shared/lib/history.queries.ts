// Shared query logic for the exam history feature.
// Consumed by both the desktop (src/app/dashboard/history/page.tsx) and mobile
// (src/app/m/dashboard/history/page.tsx) Server Component pages.

import { prisma } from "@/shared/lib/prisma";

// ─── Status config shared between pages ──────────────────────────────────────

export type AttemptStatus = "COMPLETED" | "IN_PROGRESS" | "TIMED_OUT" | "ABANDONED";

// ─── Return types ─────────────────────────────────────────────────────────────

export interface HistoryAttempt {
  id: string;
  status: string;
  score: number | null;
  totalCorrect: number | null;
  startedAt: Date;
  finishedAt: Date | null;
  package: {
    title: string;
    slug: string;
    totalQuestions: number;
  };
}

export interface HistoryQueryResult {
  attempts: HistoryAttempt[];
  total: number;
  totalPages: number;
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface HistoryQueryOptions {
  userId: string;
  page?: number;
  limit?: number;
  statusFilter?: string;
  searchQuery?: string;
  sortParam?: string;
}

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetches a paginated, filterable list of exam attempts for a given user.
 * Used by both the desktop history page (which supports search + sort) and
 * the mobile history page (which supports status filter only).
 */
export async function getHistoryAttempts(
  options: HistoryQueryOptions,
): Promise<HistoryQueryResult> {
  const {
    userId,
    page = 1,
    limit = 10,
    statusFilter,
    searchQuery = "",
    sortParam = "newest",
  } = options;

  const safePage = Math.max(1, page);

  const where = {
    userId,
    ...(statusFilter && statusFilter !== "all"
      ? { status: statusFilter as AttemptStatus }
      : {}),
    ...(searchQuery
      ? {
          package: {
            title: { contains: searchQuery, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const orderBy =
    sortParam === "oldest"
      ? { startedAt: "asc" as const }
      : sortParam === "score_desc"
        ? { score: "desc" as const }
        : sortParam === "score_asc"
          ? { score: "asc" as const }
          : { startedAt: "desc" as const };

  const [attempts, total] = await Promise.all([
    prisma.examAttempt.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * limit,
      take: limit,
      select: {
        id: true,
        status: true,
        score: true,
        totalCorrect: true,
        startedAt: true,
        finishedAt: true,
        package: {
          select: { title: true, slug: true, totalQuestions: true },
        },
      },
    }),
    prisma.examAttempt.count({ where }),
  ]);

  return {
    attempts,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Shared pure utilities ────────────────────────────────────────────────────

/**
 * Formats a duration between two dates in a human-readable Indonesian string.
 * Returns "-" when the end date is not yet available.
 */
export function formatDuration(start: Date, end: Date | null): string {
  if (!end) return "-";
  const diffMs = end.getTime() - start.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
}
