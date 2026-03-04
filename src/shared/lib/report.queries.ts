// Shared types for the report (rapor belajar) feature.
// Consumed by both the desktop (src/app/dashboard/report/) and mobile
// (src/app/m/dashboard/report/) client components.
// Data is fetched via fetch("/api/reports?period=...") inside each component.

export interface ReportSummary {
  totalAttempts: number;
  totalQuestions: number;
  totalCorrect: number;
  avgScore: number;
  totalStudyTimeMinutes: number;
  passingRate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CategoryBreakdown {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  attempts: number;
}

export interface ScoreTrend {
  date: string;
  score: number;
  package: string;
}

export interface RecentAttempt {
  packageTitle: string;
  category: string;
  score: number | null;
  totalCorrect: number | null;
  totalQuestions: number;
  finishedAt: string | null;
  passed: boolean | null;
}

export interface BadgeItem {
  name: string;
  icon: string;
  category: string;
  earnedAt: string;
}

export interface ReportData {
  user: { name: string; email: string };
  period: string;
  generatedAt: string;
  summary: ReportSummary;
  categoryBreakdown: CategoryBreakdown[];
  scoreTrend: ScoreTrend[];
  recentAttempts: RecentAttempt[];
  badges: BadgeItem[];
}

export type PeriodType = "week" | "month" | "all";
