"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Calendar,
  Target,
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

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Dialogs
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = getMonthDays(year, month);

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

  useEffect(() => {
    async function loadData() {
      try {
        const [plansRes] = await Promise.all([
          fetch("/api/planner/plans"),
        ]);
        const plansResult = await plansRes.json();
        if (plansRes.ok) setPlans(plansResult.data);
      } catch {
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

  function resetTaskForm() {
    setTaskTitle("");
    setTaskDescription("");
    setTaskPlanId("");
    setTaskDate("");
    setTaskStartTime("");
    setTaskDuration("");
    setTaskPriority("0");
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
          <Button onClick={() => { resetTaskForm(); setShowTaskDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Task Baru
          </Button>
        </div>
      </div>

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
            <CardTitle>
              {currentDate.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
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
                const hasIncompleteTasks = dayTasks.some((t) => !t.isCompleted);
                const allComplete =
                  dayTasks.length > 0 && dayTasks.every((t) => t.isCompleted);

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    onDoubleClick={() => openTaskDialogForDate(dateKey)}
                    className={cn(
                      "relative flex h-12 flex-col items-center justify-center rounded-lg text-sm transition-colors hover:bg-muted",
                      isToday && "font-bold",
                      isSelected && "bg-primary/10 ring-1 ring-primary"
                    )}
                  >
                    <span>{day}</span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasIncompleteTasks && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                        {allComplete && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
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
                  .map((task) => (
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {task.plan.title}
                          </span>
                          {task.startTime && (
                            <span className="text-xs text-muted-foreground">
                              {task.startTime}
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
                  ))}
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
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Target:{" "}
                        {new Date(plan.targetDate).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
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
    </div>
  );
}
