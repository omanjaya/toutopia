"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
  Lightbulb,
  Trash2,
  Loader2,
} from "lucide-react";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { cn } from "@/shared/lib/utils";

export interface MobileBookmarkData {
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

interface MobileBookmarkItemProps {
  bookmark: MobileBookmarkData;
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  VERY_EASY: { label: "Sangat Mudah", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  EASY: { label: "Mudah", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  MEDIUM: { label: "Sedang", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  HARD: { label: "Sulit", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
  VERY_HARD: { label: "Sangat Sulit", color: "bg-red-500/10 text-red-700 border-red-500/20" },
};

export function MobileBookmarkItem({ bookmark }: MobileBookmarkItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [removing, setRemoving] = useState(false);
  const router = useRouter();
  const q = bookmark.question;
  const diff = DIFFICULTY_MAP[q.difficulty] ?? { label: q.difficulty, color: "" };

  async function handleRemove(): Promise<void> {
    if (!confirm("Hapus bookmark ini?")) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/user/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card className={cn("transition-all", expanded && "ring-1 ring-primary/20")}>
      <CardContent className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {q.topic.subject.name}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {q.topic.name}
          </Badge>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
              diff.color,
            )}
          >
            {diff.label}
          </span>
        </div>

        {/* Question content preview */}
        <div className={cn("mt-2.5 text-sm overflow-hidden [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:overflow-x-auto", !expanded && "line-clamp-3")}>
          <MathRenderer content={q.content} />
        </div>

        {q.imageUrl && expanded && (
          <img
            src={q.imageUrl}
            alt="Gambar soal"
            className="mt-3 w-full max-h-48 rounded-lg border object-contain"
          />
        )}

        {/* Expand/Collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-medium text-muted-foreground transition-colors active:bg-muted/50"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Sembunyikan
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Lihat jawaban & pembahasan
            </>
          )}
        </button>

        {/* Expanded: Options + Explanation */}
        {expanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Options */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Pilihan Jawaban
              </p>
              {q.options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-sm transition-colors",
                    opt.isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-border",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      opt.isCorrect
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="min-w-0 flex-1 [&_img]:max-w-full [&_pre]:overflow-x-auto">
                    <MathRenderer content={opt.content} />
                    {opt.imageUrl && (
                      <img
                        src={opt.imageUrl}
                        alt={`Opsi ${String.fromCharCode(65 + idx)}`}
                        className="mt-2 max-h-32 max-w-full rounded-lg border"
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
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Pembahasan
                </p>
                <div className="flex gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div className="min-w-0 flex-1 overflow-hidden [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:overflow-x-auto">
                    <MathRenderer content={q.explanation} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer: date + remove action */}
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <p className="text-[11px] text-muted-foreground">
            Ditandai{" "}
            {new Date(bookmark.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={removing}
            className="h-9 w-9 p-0"
          >
            {removing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
