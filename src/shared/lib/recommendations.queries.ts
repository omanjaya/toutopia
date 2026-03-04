// Shared types and utilities for the recommendations feature.
// Consumed by both the desktop (src/app/dashboard/recommendations/) and mobile
// (src/app/m/dashboard/recommendations/) client components.
// Data is fetched via fetch("/api/recommendations") inside each component.

export interface TopicStat {
  topicId: string;
  topicName: string;
  subjectName: string;
  categoryName: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface RecommendedQuestion {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  topic: string;
  subject: string;
}

export interface RecommendationData {
  weakTopics: TopicStat[];
  strongTopics: TopicStat[];
  recommendedQuestions: RecommendedQuestion[];
  totalAnswered: number;
  totalTopicsAnalyzed: number;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "VERY_EASY":
      return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20";
    case "EASY":
      return "text-green-600 bg-green-50 dark:bg-green-950/20";
    case "MEDIUM":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/20";
    case "HARD":
      return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
    case "VERY_HARD":
      return "text-red-600 bg-red-50 dark:bg-red-950/20";
    default:
      return "text-muted-foreground bg-muted";
  }
}
