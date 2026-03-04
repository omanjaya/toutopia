import { BookOpen, PenLine, RotateCcw } from "lucide-react";
import type { StudyTask, TaskPhase } from "./planner.types";

export const PRIORITY_LABELS: Record<number, string> = {
  0: "Normal",
  1: "Low",
  2: "Medium",
  3: "High",
};

export const PHASE_DOT_COLORS: Record<string, string> = {
  materi: "bg-blue-500",
  latihan: "bg-amber-500",
  review: "bg-emerald-500",
  manual: "bg-primary",
};

export const PHASE_BADGE_COLORS: Record<string, string> = {
  materi: "bg-blue-100 text-blue-700",
  latihan: "bg-amber-100 text-amber-700",
  review: "bg-emerald-100 text-emerald-700",
  manual: "",
};

export const PHASE_ICONS: Record<string, typeof BookOpen> = {
  materi: BookOpen,
  latihan: PenLine,
  review: RotateCcw,
};

export const PLANNER_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return days;
}

export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getTaskPhase(task: StudyTask): TaskPhase {
  const desc = task.description?.toLowerCase() ?? "";
  if (desc.startsWith("fase materi")) return "materi";
  if (desc.startsWith("fase latihan")) return "latihan";
  if (desc.startsWith("fase persiapan") || desc.startsWith("h-1")) return "review";
  return "manual";
}

export function getDaysUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeGenPreview(
  genTargetDate: string,
  genHoursPerDay: string,
): { days: number; tasks: number } | null {
  if (!genTargetDate) return null;
  const target = new Date(genTargetDate);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (target.getTime() - tomorrow.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 7) return null;
  const hours = parseInt(genHoursPerDay) || 2;
  const estimatedTasks = Math.floor(diffDays * (hours >= 2 ? 1.7 : 1.2));
  return { days: diffDays, tasks: estimatedTasks };
}

export function computeTargetDates(plans: Array<{ targetDate: string | null }>): Set<string> {
  const dates = new Set<string>();
  for (const plan of plans) {
    if (plan.targetDate) {
      dates.add(plan.targetDate.substring(0, 10));
    }
  }
  return dates;
}

export function groupTasksByDate(tasks: StudyTask[]): Record<string, StudyTask[]> {
  const byDate: Record<string, StudyTask[]> = {};
  for (const task of tasks) {
    const dateKey = task.date.substring(0, 10);
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(task);
  }
  return byDate;
}
