"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Target,
  Sparkles,
  Clock,
  BookOpen,
  PenLine,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

interface StudyPlan {
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

interface StudyTask {
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

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const PRIORITY_LABELS: Record<number, string> = {
  0: "Normal",
  1: "Low",
  2: "Medium",
  3: "High",
};

const PRIORITY_COLORS: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  3: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return days;
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTaskPhase(task: StudyTask): "materi" | "latihan" | "review" | "manual" {
  const desc = task.description?.toLowerCase() ?? "";
  if (desc.startsWith("fase materi")) return "materi";
  if (desc.startsWith("fase latihan")) return "latihan";
  if (desc.startsWith("fase persiapan") || desc.startsWith("h-1")) return "review";
  return "manual";
}

const PHASE_DOT_COLORS: Record<string, string> = {
  materi: "bg-blue-500",
  latihan: "bg-amber-500",
  review: "bg-emerald-500",
  manual: "bg-primary",
};

const PHASE_BADGE_COLORS: Record<string, string> = {
  materi: "bg-blue-100 text-blue-700",
  latihan: "bg-amber-100 text-amber-700",
  review: "bg-emerald-100 text-emerald-700",
  manual: "",
};

const PHASE_ICONS: Record<string, typeof BookOpen> = {
  materi: BookOpen,
  latihan: PenLine,
  review: RotateCcw,
};

function getDaysUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Dialogs
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Plan form
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planTargetDate, setPlanTargetDate] = useState("");

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPlanId, setTaskPlanId] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskDuration, setTaskDuration] = useState("");
  const [taskPriority, setTaskPriority] = useState("0");

  // Generate form
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [genCategoryId, setGenCategoryId] = useState("");
  const [genTargetDate, setGenTargetDate] = useState("");
  const [genHoursPerDay, setGenHoursPerDay] = useState("2");
  const [loadingCategories, setLoadingCategories] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = getMonthDays(year, month);

  // Compute min date for generate dialog (7 days from now)
  const minTargetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().substring(0, 10);
  }, []);

  // Preview calculation for generate dialog
  const genPreview = useMemo(() => {
    if (!genTargetDate) return null;
    const target = new Date(genTargetDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (target.getTime() - tomorrow.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 7) return null;
    const hours = parseInt(genHoursPerDay) || 2;
    // Rough estimate: ~1.5-2 sessions per day
    const estimatedTasks = Math.floor(diffDays * (hours >= 2 ? 1.7 : 1.2));
    return { days: diffDays, tasks: estimatedTasks };
  }, [genTargetDate, genHoursPerDay]);

  // Collect all target dates from plans for calendar highlighting
  const targetDates = useMemo(() => {
    const dates = new Set<string>();
    for (const plan of plans) {
      if (plan.targetDate) {
        dates.add(plan.targetDate.substring(0, 10));
      }
    }
    return dates;
  }, [plans]);

  // Nearest upcoming target for countdown
  const nearestTarget = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let nearest: { plan: StudyPlan; daysLeft: number } | null = null;
    for (const plan of plans) {
      if (!plan.targetDate) continue;
      const days = getDaysUntil(plan.targetDate);
      if (days >= 0 && (!nearest || days < nearest.daysLeft)) {
        nearest = { plan, daysLeft: days };
      }
    }
    return nearest;
  }, [plans]);

  const fetchTasks = useCallback(async () => {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();

    try {
      const res = await fetch(
        `/api/planner/tasks?startDate=${startDate}&endDate=${endDate}`
      );
      const result = await res.json();
      if (res.ok) setTasks(result.data);
    } catch {
      // silent
    }
  }, [year, month]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/planner/plans");
      const result = await res.json();
      if (res.ok) setPlans(result.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        await fetchPlans();
      } catch {
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [fetchPlans]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Group tasks by date
  const tasksByDate: Record<string, StudyTask[]> = {};
  for (const task of tasks) {
    const dateKey = task.date.substring(0, 10);
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(task);
  }

  const todayStr = new Date().toISOString().substring(0, 10);

  // Weekly progress
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekTasks = tasks.filter((t) => {
    const d = new Date(t.date);
    return d >= startOfWeek && d <= endOfWeek;
  });
  const weekCompleted = weekTasks.filter((t) => t.isCompleted).length;
  const weekProgress = weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0;

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  async function handleCreatePlan() {
    if (!planTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/planner/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: planTitle,
          description: planDescription || null,
          targetDate: planTargetDate || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal membuat plan");
        return;
      }
      toast.success("Study plan berhasil dibuat");
      setPlans((prev) => [
        {
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          categoryId: null,
          categoryName: null,
          targetDate: result.data.targetDate,
          isActive: true,
          totalTasks: 0,
          completedTasks: 0,
          createdAt: result.data.createdAt,
        },
        ...prev,
      ]);
      setShowPlanDialog(false);
      setPlanTitle("");
      setPlanDescription("");
      setPlanTargetDate("");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateTask() {
    if (!taskTitle.trim() || !taskPlanId || !taskDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/planner/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: taskPlanId,
          title: taskTitle,
          description: taskDescription || null,
          date: taskDate,
          startTime: taskStartTime || null,
          duration: taskDuration ? parseInt(taskDuration) : null,
          priority: parseInt(taskPriority),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal membuat task");
        return;
      }
      toast.success("Task berhasil ditambahkan");
      setShowTaskDialog(false);
      resetTaskForm();
      fetchTasks();
    } finally {
      setSaving(false);
    }
  }

  async function handleGeneratePlan() {
    if (!genCategoryId || !genTargetDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: genCategoryId,
          targetDate: genTargetDate,
          hoursPerDay: parseInt(genHoursPerDay) || 2,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal generate jadwal");
        return;
      }
      toast.success(
        `Jadwal berhasil dibuat! ${result.data.totalTasks} task dalam ${result.data.totalDays} hari`
      );
      setShowGenerateDialog(false);
      setGenCategoryId("");
      setGenTargetDate("");
      setGenHoursPerDay("2");
      // Refresh data
      await Promise.all([fetchPlans(), fetchTasks()]);
    } finally {
      setSaving(false);
    }
  }

  function resetTaskForm() {
    setTaskTitle("");
    setTaskDescription("");
    setTaskPlanId("");
    setTaskDate("");
    setTaskStartTime("");
    setTaskDuration("");
    setTaskPriority("0");
  }

  async function openGenerateDialog() {
    setShowGenerateDialog(true);
    if (categories.length === 0) {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/categories");
        const result = await res.json();
        if (res.ok) setCategories(result.data);
      } catch {
        toast.error("Gagal memuat kategori");
      } finally {
        setLoadingCategories(false);
      }
    }
  }

  async function toggleComplete(taskId: string) {
    try {
      const res = await fetch(`/api/planner/tasks/${taskId}/complete`, {
        method: "PATCH",
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
          )
        );
      }
    } catch {
      toast.error("Gagal mengubah status");
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const res = await fetch(`/api/planner/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.success("Task dihapus");
      }
    } catch {
      toast.error("Gagal menghapus task");
    }
  }

  async function deletePlan(planId: string) {
    try {
      const res = await fetch(`/api/planner/plans/${planId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p.id !== planId));
        setTasks((prev) => prev.filter((t) => t.planId !== planId));
        toast.success("Plan dihapus");
      }
    } catch {
      toast.error("Gagal menghapus plan");
    }
  }

  function openTaskDialogForDate(dateStr: string) {
    resetTaskForm();
    setTaskDate(dateStr);
    setShowTaskDialog(true);
  }

  // Selected date tasks
  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Study Planner</h2>
          <p className="text-muted-foreground">
            Atur jadwal belajar dan pantau progres Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPlanDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Plan Baru
          </Button>
          <Button variant="outline" onClick={() => { resetTaskForm(); setShowTaskDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Task Baru
          </Button>
          <Button onClick={openGenerateDialog}>
            <Sparkles className="mr-2 h-4 w-4" />
            Buat Rencana Ujian
          </Button>
        </div>
      </div>

      {/* Countdown Banner */}
      {nearestTarget && nearestTarget.daysLeft > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{nearestTarget.plan.title}</p>
                <p className="text-sm text-muted-foreground">
                  {nearestTarget.plan.categoryName && (
                    <span>{nearestTarget.plan.categoryName} — </span>
                  )}
                  {new Date(nearestTarget.plan.targetDate!).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                H-{nearestTarget.daysLeft}
              </p>
              <p className="text-xs text-muted-foreground">hari lagi</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Progres Minggu Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={weekProgress} className="flex-1" />
            <span className="text-sm font-medium">
              {weekCompleted}/{weekTasks.length} task
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <CardTitle>
                {currentDate.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              {/* Phase legend */}
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Materi
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Latihan
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Review
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {monthDays.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} />;
                }
                const dateKey = formatDateKey(year, month, day);
                const dayTasks = tasksByDate[dateKey] ?? [];
                const isToday = dateKey === todayStr;
                const isSelected = dateKey === selectedDate;
                const isTargetDate = targetDates.has(dateKey);

                // Determine unique phases for dots
                const phases = new Set(dayTasks.map(getTaskPhase));

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    onDoubleClick={() => openTaskDialogForDate(dateKey)}
                    className={cn(
                      "relative flex h-12 flex-col items-center justify-center rounded-lg text-sm transition-colors hover:bg-muted",
                      isToday && "font-bold",
                      isSelected && "bg-primary/10 ring-1 ring-primary",
                      isTargetDate && "ring-2 ring-red-500/60 bg-red-50"
                    )}
                  >
                    <span className={cn(isTargetDate && "text-red-600 font-bold")}>
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from(phases).slice(0, 3).map((phase) => (
                          <span
                            key={phase}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              dayTasks.every((t) => t.isCompleted)
                                ? "bg-emerald-500"
                                : PHASE_DOT_COLORS[phase]
                            )}
                          />
                        ))}
                      </div>
                    )}
                    {isTargetDate && dayTasks.length === 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "id-ID",
                    { dateStyle: "long" }
                  )
                : "Pilih tanggal"}
            </CardTitle>
            {selectedDate && targetDates.has(selectedDate) && (
              <Badge variant="destructive" className="w-fit text-[10px]">
                Hari Ujian
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Klik tanggal di kalender untuk melihat task
              </p>
            ) : selectedTasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Belum ada task
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openTaskDialogForDate(selectedDate)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Tambah Task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTasks
                  .sort((a, b) => b.priority - a.priority)
                  .map((task) => {
                    const phase = getTaskPhase(task);
                    const PhaseIcon = PHASE_ICONS[phase];
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border p-2 text-sm",
                          task.isCompleted && "opacity-60"
                        )}
                      >
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                            task.isCompleted
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-muted-foreground"
                          )}
                        >
                          {task.isCompleted && <Check className="h-3 w-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "font-medium",
                              task.isCompleted && "line-through"
                            )}
                          >
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {task.plan.title}
                            </span>
                            {task.startTime && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />
                                {task.startTime}
                              </span>
                            )}
                            {task.duration && (
                              <span className="text-xs text-muted-foreground">
                                {task.duration}m
                              </span>
                            )}
                            {phase !== "manual" && (
                              <span
                                className={cn(
                                  "flex items-center gap-0.5 rounded px-1 text-[10px] font-medium",
                                  PHASE_BADGE_COLORS[phase]
                                )}
                              >
                                {PhaseIcon && <PhaseIcon className="h-2.5 w-2.5" />}
                                {phase === "materi"
                                  ? "Materi"
                                  : phase === "latihan"
                                    ? "Latihan"
                                    : "Review"}
                              </span>
                            )}
                            {task.priority > 0 && (
                              <span
                                className={cn(
                                  "rounded px-1 text-[10px] font-medium",
                                  PRIORITY_COLORS[task.priority]
                                )}
                              >
                                {PRIORITY_LABELS[task.priority]}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => openTaskDialogForDate(selectedDate)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Tambah Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Plans */}
      {plans.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Study Plans</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const progress =
                plan.totalTasks > 0
                  ? (plan.completedTasks / plan.totalTasks) * 100
                  : 0;
              const daysLeft = plan.targetDate
                ? getDaysUntil(plan.targetDate)
                : null;

              return (
                <Card key={plan.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{plan.title}</h4>
                        {plan.categoryName && (
                          <Badge variant="outline" className="mt-1">
                            {plan.categoryName}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {plan.description}
                      </p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progres</span>
                        <span>
                          {plan.completedTasks}/{plan.totalTasks}
                        </span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                    {plan.targetDate && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          Target:{" "}
                          {new Date(plan.targetDate).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}
                        </div>
                        {daysLeft !== null && daysLeft > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            H-{daysLeft}
                          </Badge>
                        )}
                        {daysLeft !== null && daysLeft === 0 && (
                          <Badge variant="destructive" className="text-[10px]">
                            Hari Ini
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Study Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="Persiapan UTBK 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Deskripsi rencana belajar..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Selesai (opsional)</Label>
              <Input
                type="date"
                value={planTargetDate}
                onChange={(e) => setPlanTargetDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPlanDialog(false)}
            >
              Batal
            </Button>
            <Button onClick={handleCreatePlan} disabled={saving || !planTitle.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Study Plan</Label>
              <Select value={taskPlanId} onValueChange={setTaskPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {plans.length === 0 && (
                <p className="text-xs text-destructive">
                  Buat study plan terlebih dahulu
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Judul Task</Label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Belajar Matematika Bab 5"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Detail..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Waktu (opsional)</Label>
                <Input
                  type="time"
                  value={taskStartTime}
                  onChange={(e) => setTaskStartTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Durasi (menit)</Label>
                <Input
                  type="number"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(e.target.value)}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label>Prioritas</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal</SelectItem>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={saving || !taskTitle.trim() || !taskPlanId || !taskDate}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Plan Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Buat Rencana Ujian
            </DialogTitle>
            <DialogDescription>
              Generate jadwal belajar otomatis berdasarkan kategori ujian dan waktu yang tersedia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori Ujian</Label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat kategori...
                </div>
              ) : (
                <Select value={genCategoryId} onValueChange={setGenCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori ujian" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!loadingCategories && categories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Belum ada kategori ujian tersedia
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tanggal Ujian</Label>
              <Input
                type="date"
                value={genTargetDate}
                onChange={(e) => setGenTargetDate(e.target.value)}
                min={minTargetDate}
              />
              <p className="text-xs text-muted-foreground">
                Minimal 7 hari dari sekarang
              </p>
            </div>

            <div className="space-y-2">
              <Label>Jam Belajar per Hari</Label>
              <Select value={genHoursPerDay} onValueChange={setGenHoursPerDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 jam/hari</SelectItem>
                  <SelectItem value="2">2 jam/hari</SelectItem>
                  <SelectItem value="3">3 jam/hari</SelectItem>
                  <SelectItem value="4">4 jam/hari</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {genPreview && (
              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <p className="text-sm font-medium">Preview</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="h-3.5 w-3.5" />
                    <span>{genPreview.days} hari tersisa</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>~{genPreview.tasks} sesi belajar</span>
                  </div>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Materi ({Math.floor(genPreview.days * 0.6)}h)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Latihan ({Math.floor(genPreview.days * 0.25)}h)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Review ({genPreview.days - Math.floor(genPreview.days * 0.6) - Math.floor(genPreview.days * 0.25)}h)
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleGeneratePlan}
              disabled={saving || !genCategoryId || !genTargetDate || !genPreview}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
