// Shared types and pure utilities for the analytics feature.
// These are consumed by both the desktop (src/app/dashboard/analytics/)
// and mobile (src/app/m/dashboard/analytics/) client components.
// The actual data fetching happens via fetch("/api/user/analytics*") inside
// each component's useEffect — there are no direct Prisma calls here.

// ─── Shared types ────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalAttempts: number;
  avgScore: number;
  bestScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
  packageTitle: string;
}

export interface CategoryPerformancePoint {
  category: string;
  avgScore: number;
  attempts: number;
}

export interface WeakestTopic {
  topicName: string;
  subjectName: string;
  errorCount: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  scoreTrend: ScoreTrendPoint[];
  categoryPerformance: CategoryPerformancePoint[];
  weakestTopics: WeakestTopic[];
}

export interface WeeklyProgress {
  week: string;
  avgScore: number;
  maxScore: number;
  attempts: number;
  categories: string[];
}

export interface Milestone {
  type: string;
  label: string;
  achieved: boolean;
}

export interface ProgressData {
  weeklyProgress: WeeklyProgress[];
  milestones: Milestone[];
  totalAttempts: number;
  bestScore: number;
}

export interface TopicData {
  id: string;
  name: string;
  mastery: number;
  correct: number;
  total: number;
}

export interface SubjectData {
  id: string;
  name: string;
  categoryName: string;
  mastery: number;
  correct: number;
  total: number;
  topics: TopicData[];
}

export interface SubjectMasteryData {
  overallMastery: number;
  totalQuestions: number;
  subjects: SubjectData[];
}

export type SortMode = "weakest" | "strongest" | "alphabetical";

export interface MonthlySummary {
  month: string;
  label: string;
  avgScore: number;
  attempts: number;
}

// ─── Pure utility functions ───────────────────────────────────────────────────

export function getMasteryColor(mastery: number): string {
  if (mastery < 40) return "text-red-500";
  if (mastery < 70) return "text-amber-500";
  return "text-emerald-500";
}

export function getMasteryBgColor(mastery: number): string {
  if (mastery < 40) return "bg-red-500";
  if (mastery < 70) return "bg-amber-500";
  return "bg-emerald-500";
}

export function getMasteryTrackColor(mastery: number): string {
  if (mastery < 40) return "bg-red-100";
  if (mastery < 70) return "bg-amber-100";
  return "bg-emerald-100";
}

// Milestone icons are Lucide components; returning the component type here
// would create a dependency on lucide-react in a shared lib file. Instead,
// the icon selection logic is expressed as a plain string discriminator so
// each component can map to the appropriate icon itself.
export type MilestoneIconKey = "star" | "award" | "trophy";

export function getMilestoneIconKey(type: string): MilestoneIconKey {
  if (type.startsWith("score_")) return "star";
  if (type === "first_exam") return "award";
  return "trophy";
}

/**
 * Aggregates weekly progress data into monthly summaries.
 * Returned array is sorted most-recent-first.
 */
export function getMonthlyFromWeekly(weekly: WeeklyProgress[]): MonthlySummary[] {
  const monthMap = new Map<string, { scores: number[]; attempts: number }>();

  for (const w of weekly) {
    const date = new Date(w.week);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { scores: [], attempts: 0 });
    }
    const m = monthMap.get(monthKey)!;
    m.scores.push(w.avgScore);
    m.attempts += w.attempts;
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
      avgScore: Math.round(
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      ),
      attempts: data.attempts,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
}
