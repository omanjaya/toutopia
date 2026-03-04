import { prisma } from "@/shared/lib/prisma";

export interface LeaderboardCategory {
  id: string;
  name: string;
}

export interface LeaderboardPackage {
  id: string;
  title: string;
  category: { name: string };
  _count: { leaderboard: number };
}

export interface LeaderboardEntry {
  id: string;
  packageId: string;
  userId: string;
  score: number;
  user: { id: string; name: string | null };
}

export interface PackageLeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  user: { id: string; name: string | null; avatar: string | null };
  attempt: { totalCorrect: number | null; finishedAt: Date | null };
}

export interface PackageLeaderboardCurrentUser {
  score: number;
  rank: number | null;
}

/**
 * Fetches published exam categories that have at least one published package.
 * Used by both desktop and mobile dashboard leaderboard index pages.
 */
export async function getLeaderboardCategories(): Promise<LeaderboardCategory[]> {
  return prisma.examCategory.findMany({
    where: {
      packages: { some: { status: "PUBLISHED" } },
    },
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });
}

/**
 * Fetches published packages, optionally filtered by category name.
 * Used by both desktop and mobile dashboard leaderboard index pages.
 */
export async function getLeaderboardPackages(
  categoryFilter: string,
): Promise<LeaderboardPackage[]> {
  return prisma.examPackage.findMany({
    where: {
      status: "PUBLISHED",
      ...(categoryFilter !== "all"
        ? { category: { name: categoryFilter } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: { select: { name: true } },
      _count: { select: { leaderboard: true } },
    },
  });
}

/**
 * Fetches all leaderboard entries for an array of package IDs in a single query.
 * Returns entries sorted by packageId asc, then score desc.
 * Used by both desktop and mobile dashboard leaderboard index pages.
 */
export async function getAllLeaderboardEntries(
  packageIds: string[],
): Promise<LeaderboardEntry[]> {
  return prisma.leaderboardEntry.findMany({
    where: { packageId: { in: packageIds } },
    orderBy: [{ packageId: "asc" }, { score: "desc" }],
    select: {
      id: true,
      packageId: true,
      userId: true,
      score: true,
      user: { select: { id: true, name: true } },
    },
  });
}

/**
 * Groups raw leaderboard entries by package, computes the current user's rank per
 * package, and slices each package's entries to the top 3.
 * Used by both desktop and mobile dashboard leaderboard index pages.
 */
export function groupEntriesByPackage(
  allTopEntries: LeaderboardEntry[],
  currentUserId: string | undefined,
): {
  entriesByPackage: Map<string, LeaderboardEntry[]>;
  userRankByPackage: Map<string, number>;
} {
  const entriesByPackage = new Map<string, LeaderboardEntry[]>();
  const userRankByPackage = new Map<string, number>();

  for (const entry of allTopEntries) {
    const list = entriesByPackage.get(entry.packageId) ?? [];
    list.push(entry);
    entriesByPackage.set(entry.packageId, list);
  }

  for (const [pkgId, list] of entriesByPackage.entries()) {
    if (currentUserId) {
      const rankIdx = list.findIndex((e) => e.userId === currentUserId);
      if (rankIdx !== -1) {
        userRankByPackage.set(pkgId, rankIdx + 1);
      }
    }
    entriesByPackage.set(pkgId, list.slice(0, 3));
  }

  return { entriesByPackage, userRankByPackage };
}

/**
 * Fetches the top 100 entries for a specific package.
 * Used by both desktop and mobile dashboard leaderboard [packageId] pages.
 */
export async function getPackageLeaderboardEntries(
  packageId: string,
): Promise<PackageLeaderboardEntry[]> {
  return prisma.leaderboardEntry.findMany({
    where: { packageId },
    orderBy: { score: "desc" },
    take: 100,
    select: {
      id: true,
      userId: true,
      score: true,
      user: { select: { id: true, name: true, avatar: true } },
      attempt: {
        select: { totalCorrect: true, finishedAt: true },
      },
    },
  });
}

/**
 * Fetches a single user's leaderboard entry for a package (for users outside
 * the top 100). Returns null if the user has no entry or is already in the list.
 * Used by both desktop and mobile dashboard leaderboard [packageId] pages.
 */
export async function getCurrentUserEntryOutsideTop100(
  packageId: string,
  userId: string,
  isInList: boolean,
): Promise<PackageLeaderboardCurrentUser | null> {
  if (isInList) return null;
  return prisma.leaderboardEntry.findUnique({
    where: {
      packageId_userId: { packageId, userId },
    },
    select: { score: true, rank: true },
  });
}
