"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/shared/lib/utils";

interface TopicData {
  id: string;
  name: string;
  mastery: number;
  correct: number;
  total: number;
}

interface SubjectData {
  id: string;
  name: string;
  categoryName: string;
  mastery: number;
  correct: number;
  total: number;
  topics: TopicData[];
}

interface SubjectMasteryData {
  overallMastery: number;
  totalQuestions: number;
  subjects: SubjectData[];
}

type SortMode = "weakest" | "strongest" | "alphabetical";

function getMasteryColor(mastery: number): string {
  if (mastery < 40) return "text-red-500";
  if (mastery < 70) return "text-amber-500";
  return "text-emerald-500";
}

function getMasteryBgColor(mastery: number): string {
  if (mastery < 40) return "bg-red-500";
  if (mastery < 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getMasteryTrackColor(mastery: number): string {
  if (mastery < 40) return "bg-red-100";
  if (mastery < 70) return "bg-amber-100";
  return "bg-emerald-100";
}

export default function SubjectMastery() {
  const [data, setData] = useState<SubjectMasteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("weakest");

  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const res = await fetch("/api/user/analytics/subjects");
        const result = await res.json();
        if (res.ok) setData(result.data);
      } catch {
        toast.error("Gagal memuat data penguasaan materi");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function toggleExpand(subjectId: string): void {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }

  function getSortedSubjects(subjects: SubjectData[]): SubjectData[] {
    const sorted = [...subjects];
    switch (sortMode) {
      case "weakest":
        return sorted.sort((a, b) => a.mastery - b.mastery);
      case "strongest":
        return sorted.sort((a, b) => b.mastery - a.mastery);
      case "alphabetical":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "id"));
      default:
        return sorted;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Gagal memuat data</p>
      </div>
    );
  }

  if (data.subjects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium">Belum ada data</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Selesaikan minimal 1 ujian untuk melihat penguasaan materi
          </p>
        </CardContent>
      </Card>
    );
  }

  const donutData = [
    { name: "Mastery", value: data.overallMastery },
    { name: "Remaining", value: 100 - data.overallMastery },
  ];

  const masteryFillColor =
    data.overallMastery < 40
      ? "#ef4444"
      : data.overallMastery < 70
        ? "#f59e0b"
        : "#10b981";

  const sortedSubjects = getSortedSubjects(data.subjects);

  return (
    <div className="space-y-6">
      {/* Overall Mastery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Penguasaan Keseluruhan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill={masteryFillColor} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-3xl font-bold", getMasteryColor(data.overallMastery))}>
                  {data.overallMastery}%
                </span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold">
                {data.overallMastery >= 70
                  ? "Penguasaan Baik"
                  : data.overallMastery >= 40
                    ? "Perlu Peningkatan"
                    : "Perlu Banyak Latihan"}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.totalQuestions} soal dijawab dari {data.subjects.length} mata pelajaran
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Urutkan:</span>
        <div className="flex gap-1">
          {([
            { key: "weakest" as const, label: "Terlemah" },
            { key: "strongest" as const, label: "Terkuat" },
            { key: "alphabetical" as const, label: "A-Z" },
          ]).map((option) => (
            <button
              key={option.key}
              onClick={() => setSortMode(option.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                sortMode === option.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sortedSubjects.map((subject) => {
          const isExpanded = expandedSubjects.has(subject.id);

          return (
            <Card key={subject.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">{subject.name}</h3>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {subject.categoryName}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>{subject.correct} benar</span>
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span>{subject.total - subject.correct} salah</span>
                    </div>
                  </div>
                  <span className={cn("text-lg font-bold", getMasteryColor(subject.mastery))}>
                    {subject.mastery}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className={cn("mt-3 h-2 w-full rounded-full", getMasteryTrackColor(subject.mastery))}>
                  <div
                    className={cn("h-full rounded-full transition-all", getMasteryBgColor(subject.mastery))}
                    style={{ width: `${subject.mastery}%` }}
                  />
                </div>

                {/* Expand Topics */}
                {subject.topics.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleExpand(subject.id)}
                      className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Sembunyikan topik
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Lihat {subject.topics.length} topik
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        {subject.topics.map((topic) => (
                          <div key={topic.id} className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{topic.name}</p>
                              <div className={cn("mt-1 h-1.5 w-full rounded-full", getMasteryTrackColor(topic.mastery))}>
                                <div
                                  className={cn("h-full rounded-full", getMasteryBgColor(topic.mastery))}
                                  style={{ width: `${topic.mastery}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <span className={cn("text-xs font-semibold", getMasteryColor(topic.mastery))}>
                                {topic.mastery}%
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                ({topic.correct}/{topic.total})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
