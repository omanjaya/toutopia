"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle2, X, Lightbulb } from "lucide-react";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { cn } from "@/shared/lib/utils";
import { BookmarkActions } from "./bookmark-actions";

export interface BookmarkData {
  id: string;
  createdAt: string;
  question: {
    id: string;
    content: string;
    explanation: string | null;
    imageUrl: string | null;
    difficulty: string;
    type: string;
    options: {
      id: string;
      content: string;
      imageUrl: string | null;
      isCorrect: boolean;
    }[];
    topic: {
      name: string;
      subject: {
        name: string;
      };
    };
  };
}

interface BookmarkItemProps {
  bookmark: BookmarkData;
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  VERY_EASY: { label: "Sangat Mudah", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  EASY: { label: "Mudah", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  MEDIUM: { label: "Sedang", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  HARD: { label: "Sulit", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
  VERY_HARD: { label: "Sangat Sulit", color: "bg-red-500/10 text-red-700 border-red-500/20" },
};

export function BookmarkItem({ bookmark }: BookmarkItemProps) {
  const [expanded, setExpanded] = useState(false);
  const q = bookmark.question;
  const diff = DIFFICULTY_MAP[q.difficulty] ?? { label: q.difficulty, color: "" };

  return (
    <Card className={cn("transition-all", expanded && "ring-1 ring-primary/20")}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{q.topic.subject.name}</Badge>
              <Badge variant="secondary">{q.topic.name}</Badge>
              <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", diff.color)}>
                {diff.label}
              </span>
            </div>

            {/* Question content */}
            <div className={cn("text-sm", !expanded && "line-clamp-3")}>
              <MathRenderer content={q.content} />
            </div>

            {q.imageUrl && expanded && (
              <img
                src={q.imageUrl}
                alt="Gambar soal"
                className="max-h-48 rounded-lg border"
              />
            )}

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Lihat jawaban & pembahasan
                </>
              )}
            </Button>

            {/* Expanded: Options + Explanation */}
            {expanded && (
              <div className="space-y-4 border-t pt-4">
                {/* Options */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pilihan Jawaban
                  </p>
                  {q.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors",
                        opt.isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-border"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          opt.isCorrect
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="flex-1">
                        <MathRenderer content={opt.content} />
                        {opt.imageUrl && (
                          <img
                            src={opt.imageUrl}
                            alt={`Opsi ${String.fromCharCode(65 + idx)}`}
                            className="mt-2 max-h-32 rounded-lg border"
                          />
                        )}
                      </div>
                      {opt.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/20" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pembahasan
                    </p>
                    <div className="flex gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <div className="flex-1">
                        <MathRenderer content={q.explanation} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Ditandai{" "}
              {new Date(bookmark.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <BookmarkActions bookmarkId={bookmark.id} />
        </div>
      </CardContent>
    </Card>
  );
}
