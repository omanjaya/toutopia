"use client";

import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { cn } from "@/shared/lib/utils";

interface PracticeOption {
  id: string;
  label: string;
  content: string;
  imageUrl: string | null;
  isCorrect: boolean;
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
  options: PracticeOption[];
}

interface PracticeSessionProps {
  questions: PracticeQuestion[];
  onRestart: () => void;
  onRestartSame: () => void;
}

interface AnswerState {
  selectedOptionId: string | null;
  isRevealed: boolean;
}

export function PracticeSession({
  questions,
  onRestart,
  onRestartSame,
}: PracticeSessionProps): React.JSX.Element {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers[currentQuestion.id];
  const isAnswered = currentAnswer?.isRevealed ?? false;

  const selectOption = useCallback(
    (optionId: string): void => {
      if (isAnswered) return;

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          selectedOptionId: optionId,
          isRevealed: true,
        },
      }));
    },
    [currentQuestion.id, isAnswered]
  );

  function goToNext(): void {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowSummary(true);
    }
  }

  function goToPrev(): void {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  }

  // Calculate results
  const totalAnswered = Object.values(answers).filter(
    (a) => a.isRevealed
  ).length;
  const totalCorrect = questions.filter((q) => {
    const answer = answers[q.id];
    if (!answer?.selectedOptionId) return false;
    const selectedOption = q.options.find(
      (o) => o.id === answer.selectedOptionId
    );
    return selectedOption?.isCorrect ?? false;
  }).length;

  if (showSummary) {
    const percentage =
      totalAnswered > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold">Latihan Selesai!</h3>
            <div className="space-y-1">
              <p className="text-4xl font-bold text-primary">{percentage}%</p>
              <p className="text-muted-foreground">
                {totalCorrect} benar dari {questions.length} soal
              </p>
              {totalAnswered < questions.length && (
                <p className="text-sm text-muted-foreground">
                  ({questions.length - totalAnswered} soal tidak dijawab)
                </p>
              )}
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Ringkasan per soal
            </p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {questions.map((q, idx) => {
                const answer = answers[q.id];
                const selected = answer?.selectedOptionId;
                const isCorrect = selected
                  ? q.options.find((o) => o.id === selected)?.isCorrect ?? false
                  : false;
                const wasAnswered = answer?.isRevealed ?? false;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setShowSummary(false);
                      setCurrentIdx(idx);
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      wasAnswered
                        ? isCorrect
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onRestart}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ubah Pengaturan
            </Button>
            <Button className="flex-1" onClick={onRestartSame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Latihan Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedOptionId = currentAnswer?.selectedOptionId ?? null;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {currentIdx + 1}/{questions.length}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentQuestion.subjectName} &middot; {currentQuestion.topicName}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCorrect} benar dari {totalAnswered} dijawab
        </div>
      </div>

      {/* Question Navigation Grid */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, idx) => {
          const answer = answers[q.id];
          const selected = answer?.selectedOptionId;
          const wasAnswered = answer?.isRevealed ?? false;
          const isCorrect = selected
            ? q.options.find((o) => o.id === selected)?.isCorrect ?? false
            : false;
          const isActive = idx === currentIdx;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : wasAnswered
                  ? isCorrect
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Content */}
      <Card>
        <CardContent className="pt-6">
          <MathRenderer
            content={currentQuestion.content}
            className="prose prose-sm max-w-none dark:prose-invert"
          />
          {currentQuestion.imageUrl && (
            <img
              src={currentQuestion.imageUrl}
              alt="Gambar soal"
              className="mt-4 max-h-64 rounded-lg"
            />
          )}
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const showResult = isAnswered;

          let optionStyle = "hover:border-muted-foreground/30 hover:bg-muted/50";
          if (showResult) {
            if (option.isCorrect) {
              optionStyle = "border-emerald-500 bg-emerald-50";
            } else if (isSelected && !option.isCorrect) {
              optionStyle = "border-red-500 bg-red-50";
            } else {
              optionStyle = "opacity-60";
            }
          } else if (isSelected) {
            optionStyle = "border-primary bg-primary/5";
          }

          return (
            <button
              key={option.id}
              onClick={() => selectOption(option.id)}
              disabled={isAnswered}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                optionStyle
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  showResult && option.isCorrect
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : showResult && isSelected && !option.isCorrect
                    ? "border-red-500 bg-red-500 text-white"
                    : isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {option.label}
              </span>
              <div className="flex-1 pt-1">
                <MathRenderer content={option.content} className="text-sm" />
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={`Opsi ${option.label}`}
                    className="mt-2 max-h-48 rounded-lg"
                  />
                )}
              </div>
              {showResult && option.isCorrect && (
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />
              )}
              {showResult && isSelected && !option.isCorrect && (
                <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isAnswered && currentQuestion.explanation && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <p className="mb-2 text-sm font-semibold text-blue-700">
              Pembahasan
            </p>
            <MathRenderer
              content={currentQuestion.explanation}
              className="prose prose-sm max-w-none text-blue-900"
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={goToPrev}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Sebelumnya
        </Button>
        <Button onClick={goToNext}>
          {currentIdx === questions.length - 1 ? (
            "Lihat Hasil"
          ) : (
            <>
              Selanjutnya
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
