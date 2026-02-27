"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { QuestionForm } from "@/shared/components/exam/question-form";
import type { CreateQuestionInput } from "@/shared/lib/validators/question.validators";

interface QuestionData {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  status: string;
  source: string | null;
  year: number | null;
  explanation: string | null;
  imageUrl: string | null;
  topicId: string;
  reviewNote: string | null;
  topic: {
    name: string;
    subject: {
      name: string;
      subCategory: {
        name: string;
        category: { name: string };
      };
    };
  };
  options: {
    id: string;
    label: string;
    content: string;
    imageUrl: string | null;
    isCorrect: boolean;
    order: number;
  }[];
  [key: string]: unknown;
}

interface Category {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
    subjects: {
      id: string;
      name: string;
      topics: { id: string; name: string }[];
    }[];
  }[];
}

interface QuestionDetailProps {
  question: QuestionData;
  categories: Category[];
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  APPROVED: { label: "Disetujui", variant: "default" },
  PENDING_REVIEW: { label: "Menunggu Review", variant: "outline" },
  DRAFT: { label: "Draft", variant: "secondary" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
};

const difficultyLabel: Record<string, string> = {
  VERY_EASY: "Sangat Mudah",
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HARD: "Sulit",
  VERY_HARD: "Sangat Sulit",
};

const typeLabel: Record<string, string> = {
  SINGLE_CHOICE: "Pilihan Tunggal",
  MULTIPLE_CHOICE: "Pilihan Ganda",
  TRUE_FALSE: "Benar/Salah",
  NUMERIC: "Numerik",
};

export function QuestionDetail({ question, categories }: QuestionDetailProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = statusConfig[question.status] ?? {
    label: question.status,
    variant: "secondary" as const,
  };

  async function handleReview(action: "APPROVED" | "REJECTED") {
    setIsReviewing(true);
    try {
      const response = await fetch(
        `/api/admin/questions/${question.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action, reviewNote: reviewNote || null }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal mereview soal");
        return;
      }

      toast.success(
        action === "APPROVED" ? "Soal disetujui" : "Soal ditolak"
      );
      router.refresh();
    } finally {
      setIsReviewing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus soal ini? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal menghapus soal");
        return;
      }

      toast.success("Soal berhasil dihapus");
      router.push("/admin/questions");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  if (mode === "edit") {
    const initialData: CreateQuestionInput & { id: string } = {
      id: question.id,
      topicId: question.topicId,
      type: question.type as CreateQuestionInput["type"],
      difficulty: question.difficulty as CreateQuestionInput["difficulty"],
      content: question.content,
      explanation: question.explanation ?? null,
      source: question.source ?? null,
      year: question.year ?? null,
      imageUrl: question.imageUrl ?? null,
      options: question.options.map((opt) => ({
        label: opt.label,
        content: opt.content,
        imageUrl: opt.imageUrl ?? null,
        isCorrect: opt.isCorrect,
        order: opt.order,
      })),
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Soal</h2>
            <p className="text-muted-foreground">Perbarui konten soal</p>
          </div>
          <Button variant="outline" onClick={() => setMode("view")}>
            Batal Edit
          </Button>
        </div>

        <QuestionForm
          categories={categories}
          initialData={initialData}
          backUrl={`/admin/questions/${question.id}`}
          apiUrl={`/api/admin/questions/${question.id}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/questions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Detail Soal</h2>
            <p className="text-muted-foreground">
              {question.topic.subject.subCategory.category.name} &gt;{" "}
              {question.topic.subject.subCategory.name} &gt;{" "}
              {question.topic.subject.name} &gt; {question.topic.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("edit")}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Hapus
          </Button>
        </div>
      </div>

      {/* Question Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipe</p>
              <p className="text-sm">{typeLabel[question.type] ?? question.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kesulitan</p>
              <p className="text-sm">
                {difficultyLabel[question.difficulty] ?? question.difficulty}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sumber</p>
              <p className="text-sm">{question.source ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tahun</p>
              <p className="text-sm">{question.year ?? "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Content */}
      <Card>
        <CardHeader>
          <CardTitle>Pertanyaan</CardTitle>
        </CardHeader>
        <CardContent>
          <MathRenderer
            content={question.content}
            className="prose prose-sm max-w-none dark:prose-invert"
          />
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Opsi Jawaban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                option.isCorrect
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                  : ""
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  option.isCorrect
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {option.label}
              </span>
              <MathRenderer
                content={option.content}
                className="flex-1 text-sm"
              />
              {option.isCorrect && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Explanation */}
      {question.explanation && (
        <Card>
          <CardHeader>
            <CardTitle>Pembahasan</CardTitle>
          </CardHeader>
          <CardContent>
            <MathRenderer
              content={question.explanation}
              className="prose prose-sm max-w-none dark:prose-invert"
            />
          </CardContent>
        </Card>
      )}

      {/* Review Note */}
      {question.reviewNote && (
        <Card>
          <CardHeader>
            <CardTitle>Catatan Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{question.reviewNote}</p>
          </CardContent>
        </Card>
      )}

      {/* Review Actions */}
      {(question.status === "PENDING_REVIEW" || question.status === "DRAFT") && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Review Soal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Catatan Review (opsional)</Label>
                <Textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Tulis catatan review jika ada..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview("APPROVED")}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Setujui
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReview("REJECTED")}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Tolak
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
