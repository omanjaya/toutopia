"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Dumbbell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { PracticeSession } from "./practice-session";

interface Topic {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

interface SubCategory {
  id: string;
  name: string;
  subjects: Subject[];
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

interface PracticeQuestion {
  id: string;
  index: number;
  content: string;
  type: string;
  imageUrl: string | null;
  explanation: string | null;
  topicName: string;
  subjectName: string;
  options: {
    id: string;
    label: string;
    content: string;
    imageUrl: string | null;
    isCorrect: boolean;
  }[];
}

interface PracticeSetupProps {
  categories: Category[];
}

const DIFFICULTY_OPTIONS = [
  { value: "VERY_EASY", label: "Sangat Mudah" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
  { value: "VERY_HARD", label: "Sangat Sulit" },
] as const;

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30, 40, 50] as const;

export function PracticeSetup({ categories }: PracticeSetupProps): React.JSX.Element {
  const [categoryId, setCategoryId] = useState<string>("");
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedSubCategory = selectedCategory?.subCategories.find(
    (sc) => sc.id === subCategoryId
  );
  const selectedSubject = selectedSubCategory?.subjects.find(
    (s) => s.id === subjectId
  );

  function handleCategoryChange(value: string): void {
    setCategoryId(value);
    setSubCategoryId("");
    setSubjectId("");
    setTopicId("");
  }

  function handleSubCategoryChange(value: string): void {
    setSubCategoryId(value);
    setSubjectId("");
    setTopicId("");
  }

  function handleSubjectChange(value: string): void {
    setSubjectId(value);
    setTopicId("");
  }

  async function handleStart(): Promise<void> {
    setIsLoading(true);

    try {
      const body: Record<string, string | number> = {
        questionCount,
      };

      // Use the most specific filter available
      if (topicId) {
        body.topicId = topicId;
      } else if (subjectId) {
        body.subjectId = subjectId;
      } else if (categoryId) {
        body.categoryId = categoryId;
      }

      if (difficulty) {
        body.difficulty = difficulty;
      }

      const response = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal memuat soal latihan");
        return;
      }

      setQuestions(result.data.questions);
    } catch {
      toast.error("Gagal memulai latihan");
    } finally {
      setIsLoading(false);
    }
  }

  function handleRestart(): void {
    setQuestions(null);
  }

  async function handleRestartSameSettings(): Promise<void> {
    setQuestions(null);
    // Small delay to reset UI then auto-start
    await handleStart();
  }

  // If practice session is active, show it
  if (questions) {
    return (
      <PracticeSession
        questions={questions}
        onRestart={handleRestart}
        onRestartSame={handleRestartSameSettings}
      />
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Category */}
        <div className="space-y-2">
          <Label>Kategori Ujian</Label>
          <Select value={categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Category */}
        {selectedCategory && selectedCategory.subCategories.length > 0 && (
          <div className="space-y-2">
            <Label>Sub Kategori</Label>
            <Select
              value={subCategoryId}
              onValueChange={handleSubCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih sub kategori (opsional)" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory.subCategories.map((sc) => (
                  <SelectItem key={sc.id} value={sc.id}>
                    {sc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject */}
        {selectedSubCategory && selectedSubCategory.subjects.length > 0 && (
          <div className="space-y-2">
            <Label>Mata Pelajaran</Label>
            <Select value={subjectId} onValueChange={handleSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran (opsional)" />
              </SelectTrigger>
              <SelectContent>
                {selectedSubCategory.subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Topic */}
        {selectedSubject && selectedSubject.topics.length > 0 && (
          <div className="space-y-2">
            <Label>Topik</Label>
            <Select value={topicId} onValueChange={setTopicId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih topik (opsional)" />
              </SelectTrigger>
              <SelectContent>
                {selectedSubject.topics.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Tingkat Kesulitan</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Semua tingkat kesulitan" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Count */}
        <div className="space-y-2">
          <Label>Jumlah Soal</Label>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  questionCount === count
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                )}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Dumbbell className="mr-2 h-5 w-5" />
          )}
          Mulai Latihan
        </Button>
      </CardContent>
    </Card>
  );
}
