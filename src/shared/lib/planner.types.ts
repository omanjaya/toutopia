export interface StudyPlan {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  targetDate: string | null;
  isActive: boolean;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  planId: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  duration: number | null;
  isCompleted: boolean;
  priority: number;
  plan: { id: string; title: string };
}

export interface ExamCategoryForPlanner {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export type TaskPhase = "materi" | "latihan" | "review" | "manual";
