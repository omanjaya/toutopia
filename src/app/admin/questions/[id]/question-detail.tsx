"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  FileText,
  Info,
  AlignLeft,
  ListChecks,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { LazyMathRenderer as MathRenderer } from "@/shared/components/shared/lazy-math-renderer";
import { QuestionForm } from "@/shared/components/exam/question-form";
import type { CreateQuestionInput } from "@/shared/lib/validators/question.validators";
import { Breadcrumb } from "@/shared/components/layout/breadcrumb";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

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

const statusBadgeClass: Record<string, string> = {
  APPROVED: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  PENDING_REVIEW: "bg-amber-500/10 text-amber-700 border-amber-200",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200",
  REJECTED: "bg-red-500/10 text-red-700 border-red-200",
};

const statusLabel: Record<string, string> = {
  APPROVED: "Disetujui",
  PENDING_REVIEW: "Menunggu Review",
  DRAFT: "Draft",
  REJECTED: "Ditolak",
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMode("view")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Edit Soal</h2>
              <p className="text-sm text-muted-foreground">Perbarui konten soal</p>
            </div>
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
      <Breadcrumb
        items={[
          { label: "Bank Soal", href: "/admin/questions" },
          { label: "Detail Soal" },
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/admin/questions">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Detail Soal</h2>
            <p className="text-sm text-muted-foreground">
              {question.topic.subject.subCategory.category.name} &gt;{" "}
              {question.topic.subject.subCategory.name} &gt;{" "}
              {question.topic.subject.name} &gt; {question.topic.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusBadgeClass[question.status] ?? ""}>
            {statusLabel[question.status] ?? question.status}
          </Badge>
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
      <div className={cardCls}>
        <SectionHeader icon={Info} title="Informasi Soal" />
        <div className="p-5">
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
        </div>
      </div>

      {/* Question Content */}
      <div className={cardCls}>
        <SectionHeader icon={AlignLeft} title="Pertanyaan" />
        <div className="p-5">
          <MathRenderer
            content={question.content}
            className="prose prose-sm max-w-none dark:prose-invert"
          />
        </div>
      </div>

      {/* Options */}
      <div className={cardCls}>
        <SectionHeader icon={ListChecks} title="Opsi Jawaban" />
        <div className="space-y-3 p-5">
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
        </div>
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className={cardCls}>
          <SectionHeader icon={BookOpen} title="Pembahasan" />
          <div className="p-5">
            <MathRenderer
              content={question.explanation}
              className="prose prose-sm max-w-none dark:prose-invert"
            />
          </div>
        </div>
      )}

      {/* Review Note */}
      {question.reviewNote && (
        <div className={cardCls}>
          <SectionHeader icon={MessageSquare} title="Catatan Review" />
          <div className="p-5">
            <p className="text-sm">{question.reviewNote}</p>
          </div>
        </div>
      )}

      {/* Review Actions */}
      {(question.status === "PENDING_REVIEW" || question.status === "DRAFT") && (
        <>
          <Separator />
          <div className={cardCls}>
            <SectionHeader icon={ClipboardCheck} title="Review Soal" />
            <div className="space-y-4 p-5">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
