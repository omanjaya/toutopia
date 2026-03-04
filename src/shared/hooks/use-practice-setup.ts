"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { PracticeCategory, PracticeQuestion } from "@/shared/lib/practice.queries";

export interface UsePracticeSetupOptions {
  categories: PracticeCategory[];
}

export interface UsePracticeSetupReturn {
  categoryId: string;
  subCategoryId: string;
  subjectId: string;
  topicId: string;
  difficulty: string;
  questionCount: number;
  isLoading: boolean;
  questions: PracticeQuestion[] | null;
  selectedCategory: PracticeCategory | undefined;
  selectedSubCategory: PracticeCategory["subCategories"][number] | undefined;
  selectedSubject: PracticeCategory["subCategories"][number]["subjects"][number] | undefined;
  setCategoryId: (id: string) => void;
  setTopicId: (id: string) => void;
  setDifficulty: (d: string) => void;
  setQuestionCount: (n: number) => void;
  handleCategoryChange: (value: string) => void;
  handleSubCategoryChange: (value: string) => void;
  handleSubjectChange: (value: string) => void;
  handleStart: () => Promise<void>;
  handleRestart: () => void;
  handleRestartSameSettings: () => Promise<void>;
}

/**
 * Encapsulates all state and API interactions for the practice setup flow.
 * Shared between desktop (PracticeSetup) and mobile (MobilePracticeSetup).
 */
export function usePracticeSetup({
  categories,
}: UsePracticeSetupOptions): UsePracticeSetupReturn {
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
    (sc) => sc.id === subCategoryId,
  );
  const selectedSubject = selectedSubCategory?.subjects.find(
    (s) => s.id === subjectId,
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

      setQuestions(result.data.questions as PracticeQuestion[]);
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
    await handleStart();
  }

  return {
    categoryId,
    subCategoryId,
    subjectId,
    topicId,
    difficulty,
    questionCount,
    isLoading,
    questions,
    selectedCategory,
    selectedSubCategory,
    selectedSubject,
    setCategoryId,
    setTopicId,
    setDifficulty,
    setQuestionCount,
    handleCategoryChange,
    handleSubCategoryChange,
    handleSubjectChange,
    handleStart,
    handleRestart,
    handleRestartSameSettings,
  };
}
