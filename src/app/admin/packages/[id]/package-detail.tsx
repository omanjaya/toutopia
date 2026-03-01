"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Globe,
  Clock,
  FileText,
  Users,
  Shield,
  Wand2,
  Sparkles,
  BookOpen,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { PackageForm } from "@/shared/components/exam/package-form";
import { formatCurrency, truncate } from "@/shared/lib/utils";
import type { CreatePackageInput } from "@/shared/lib/validators/package.validators";
import { GenerateSectionModal } from "@/shared/components/exam/generate-section-modal";
import { BatchGenerateDialog } from "@/app/admin/packages/[id]/batch-generate-dialog";
import { detectExamTypeFromCategory } from "@/shared/lib/exam-templates";
import { AddFromBankDialog } from "@/shared/components/exam/add-from-bank-dialog";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

interface PackageData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  price: number;
  discountPrice: number | null;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number | null;
  isFree: boolean;
  isAntiCheat: boolean;
  status: string;
  maxAttempts: number;
  category: { name: string };
  sections: {
    id: string;
    title: string;
    durationMinutes: number;
    totalQuestions: number;
    order: number;
    subject: { id: string; name: string };
    questions: {
      order: number;
      question: {
        id: string;
        content: string;
        type: string;
        difficulty: string;
      };
    }[];
  }[];
  _count: { attempts: number };
  [key: string]: unknown;
}

interface Category {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
    subjects: { id: string; name: string }[];
  }[];
}

interface PackageDetailProps {
  pkg: PackageData;
  categories: Category[];
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  PUBLISHED: { label: "Published", variant: "default" },
  DRAFT: { label: "Draft", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline" },
};

const difficultyLabel: Record<string, string> = {
  VERY_EASY: "Sangat Mudah",
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HARD: "Sulit",
  VERY_HARD: "Sangat Sulit",
};

export function PackageDetail({ pkg, categories }: PackageDetailProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generateSection, setGenerateSection] = useState<{
    sectionId: string;
    sectionTitle: string;
    subjectId: string;
    needed: number;
  } | null>(null);
  const [showBatchGenerate, setShowBatchGenerate] = useState(false);

  // Feature 1: Remove question state
  const [isRemovingQuestion, setIsRemovingQuestion] = useState<
    Record<string, boolean>
  >({});

  // Feature 3: Add from bank state
  const [addFromBank, setAddFromBank] = useState<{
    sectionId: string;
    sectionTitle: string;
    subjectId: string;
    currentQuestionIds: string[];
    capacity: number;
  } | null>(null);

  // Feature 4: Reorder state
  const [isReordering, setIsReordering] = useState(false);

  const detectedExamType = detectExamTypeFromCategory(pkg.category.name) ?? "";

  const status = statusConfig[pkg.status] ?? {
    label: pkg.status,
    variant: "secondary" as const,
  };

  async function handlePublish() {
    setIsPublishing(true);
    try {
      const response = await fetch(
        `/api/admin/packages/${pkg.id}/publish`,
        { method: "POST" }
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal publish paket");
        return;
      }
      toast.success("Paket berhasil dipublish");
      router.refresh();
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus paket ini?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal menghapus paket");
        return;
      }
      toast.success(
        result.data?.archived
          ? "Paket diarsipkan (ada peserta)"
          : "Paket berhasil dihapus"
      );
      router.push("/admin/packages");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  // Feature 1: Remove question from section
  async function handleRemoveQuestion(
    sectionId: string,
    questionId: string
  ): Promise<void> {
    if (!confirm("Yakin ingin menghapus soal ini dari section?")) return;

    const key = `${sectionId}-${questionId}`;
    setIsRemovingQuestion((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(
        `/api/admin/packages/${pkg.id}/sections/${sectionId}/questions/${questionId}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal menghapus soal");
        return;
      }
      toast.success("Soal berhasil dihapus dari section");
      router.refresh();
    } finally {
      setIsRemovingQuestion((prev) => ({ ...prev, [key]: false }));
    }
  }

  // Feature 4: Reorder sections
  async function handleReorderSection(
    sectionId: string,
    direction: "up" | "down"
  ): Promise<void> {
    const sortedSections = [...pkg.sections].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSections.findIndex((s) => s.id === sectionId);

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sortedSections.length - 1)
      return;

    const swapIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newOrder = sortedSections.map((s) => s.id);
    // Swap positions
    const temp = newOrder[currentIndex];
    newOrder[currentIndex] = newOrder[swapIndex];
    newOrder[swapIndex] = temp;

    setIsReordering(true);
    try {
      const response = await fetch(
        `/api/admin/packages/${pkg.id}/sections/reorder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: newOrder }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal mengubah urutan section");
        return;
      }
      router.refresh();
    } finally {
      setIsReordering(false);
    }
  }

  if (mode === "edit") {
    const initialData: CreatePackageInput & { id: string } = {
      id: pkg.id,
      categoryId: pkg.categoryId,
      title: pkg.title,
      slug: pkg.slug,
      description: pkg.description ?? null,
      price: pkg.price,
      discountPrice: pkg.discountPrice ?? null,
      durationMinutes: pkg.durationMinutes,
      totalQuestions: pkg.totalQuestions,
      passingScore: pkg.passingScore ?? null,
      isFree: pkg.isFree,
      isAntiCheat: pkg.isAntiCheat,
      maxAttempts: pkg.maxAttempts,
      sections: pkg.sections.map((s) => ({
        subjectId: s.subject.id,
        title: s.title,
        durationMinutes: s.durationMinutes,
        totalQuestions: s.totalQuestions,
        order: s.order,
      })),
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Paket</h2>
            <p className="text-muted-foreground">Perbarui detail paket ujian</p>
          </div>
          <Button variant="outline" onClick={() => setMode("view")}>
            Batal Edit
          </Button>
        </div>
        <PackageForm
          categories={categories}
          initialData={initialData}
          backUrl={`/admin/packages/${pkg.id}`}
          apiUrl={`/api/admin/packages/${pkg.id}`}
        />
      </div>
    );
  }

  const sortedSections = [...pkg.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/packages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{pkg.title}</h2>
            <p className="text-muted-foreground">{pkg.category.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          {(pkg.status === "DRAFT" || pkg.status === "PUBLISHED") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBatchGenerate(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Semua
            </Button>
          )}
          {pkg.status === "DRAFT" && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Globe className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          )}
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

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Soal</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{pkg.totalQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Durasi</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{pkg.durationMinutes} menit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Harga</p>
            <p className="mt-1 text-2xl font-bold">
              {pkg.isFree ? "Gratis" : formatCurrency(pkg.price)}
            </p>
            {pkg.discountPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatCurrency(pkg.discountPrice)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Peserta</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{pkg._count.attempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Anti-Cheat</p>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {pkg.isAntiCheat ? "Aktif" : "Nonaktif"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {pkg.description && (
        <Card>
          <CardHeader>
            <CardTitle>Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{pkg.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Section Ujian ({pkg.sections.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedSections.map((section, idx) => {
            const pct = Math.round(
              (section.questions.length / section.totalQuestions) * 100
            );
            return (
              <div key={section.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {idx + 1}. {section.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {section.subject.name} &middot; {section.totalQuestions} soal
                      &middot; {section.durationMinutes} menit
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Feature 4: Up/Down reorder buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReorderSection(section.id, "up")}
                      disabled={isReordering || idx === 0}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReorderSection(section.id, "down")}
                      disabled={
                        isReordering || idx === sortedSections.length - 1
                      }
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>

                    {/* Fill badge */}
                    <Badge
                      variant={
                        section.questions.length >= section.totalQuestions
                          ? "default"
                          : "outline"
                      }
                    >
                      {section.questions.length}/{section.totalQuestions} soal
                    </Badge>

                    {/* Feature 3: Add from bank button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAddFromBank({
                          sectionId: section.id,
                          sectionTitle: section.title,
                          subjectId: section.subject.id,
                          currentQuestionIds: section.questions.map(
                            (sq) => sq.question.id
                          ),
                          capacity:
                            section.totalQuestions - section.questions.length,
                        })
                      }
                      disabled={
                        section.questions.length >= section.totalQuestions
                      }
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      Dari Bank
                    </Button>

                    {/* Generate Soal button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setGenerateSection({
                          sectionId: section.id,
                          sectionTitle: section.title,
                          subjectId: section.subject.id,
                          needed:
                            section.totalQuestions - section.questions.length,
                        })
                      }
                      disabled={
                        section.questions.length >= section.totalQuestions
                      }
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                      {section.questions.length >= section.totalQuestions
                        ? "Penuh"
                        : "Generate Soal"}
                    </Button>
                  </div>
                </div>

                {/* Feature 2: Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      pct >= 100
                        ? "bg-emerald-500"
                        : pct >= 50
                          ? "bg-amber-500"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                {section.questions.length > 0 && (
                  <div className="space-y-1">
                    {section.questions.map((sq, qIdx) => {
                      const removeKey = `${section.id}-${sq.question.id}`;
                      return (
                        <div
                          key={sq.question.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-6 text-right text-muted-foreground">
                            {qIdx + 1}.
                          </span>
                          <span className="flex-1 truncate">
                            {truncate(stripHtml(sq.question.content), 60)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {difficultyLabel[sq.question.difficulty] ??
                              sq.question.difficulty}
                          </Badge>
                          {/* Feature 1: Remove question button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleRemoveQuestion(
                                section.id,
                                sq.question.id
                              )
                            }
                            disabled={isRemovingQuestion[removeKey]}
                          >
                            {isRemovingQuestion[removeKey] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Separator />

      <div className="text-sm text-muted-foreground">
        Slug: <code className="rounded bg-muted px-1">{pkg.slug}</code>
        &middot; Maks. percobaan: {pkg.maxAttempts}x
        {pkg.passingScore && <> &middot; Passing score: {pkg.passingScore}</>}
      </div>

      {/* Generate Section Modal */}
      {generateSection && (
        <GenerateSectionModal
          open={!!generateSection}
          onOpenChange={(open) => {
            if (!open) setGenerateSection(null);
          }}
          packageId={pkg.id}
          sectionId={generateSection.sectionId}
          sectionTitle={generateSection.sectionTitle}
          subjectId={generateSection.subjectId}
          needed={generateSection.needed}
          examType={detectedExamType}
          onSuccess={({ generated, remaining }) => {
            toast.success(
              `${generated} soal berhasil digenerate${
                remaining > 0
                  ? `. Masih butuh ${remaining} soal lagi.`
                  : ". Seksi penuh!"
              }`
            );
            setGenerateSection(null);
            router.refresh();
          }}
        />
      )}

      {/* Batch Generate Dialog */}
      <BatchGenerateDialog
        open={showBatchGenerate}
        onOpenChange={setShowBatchGenerate}
        packageId={pkg.id}
        examType={detectedExamType}
        sections={pkg.sections.map((s) => ({
          id: s.id,
          title: s.title,
          totalQuestions: s.totalQuestions,
          currentCount: s.questions.length,
        }))}
        onComplete={() => {
          setShowBatchGenerate(false);
          router.refresh();
        }}
      />

      {/* Feature 3: Add from Bank Dialog */}
      {addFromBank && (
        <AddFromBankDialog
          open={!!addFromBank}
          onOpenChange={(open) => {
            if (!open) setAddFromBank(null);
          }}
          packageId={pkg.id}
          sectionId={addFromBank.sectionId}
          sectionTitle={addFromBank.sectionTitle}
          subjectId={addFromBank.subjectId}
          currentQuestionIds={addFromBank.currentQuestionIds}
          capacity={addFromBank.capacity}
          onSuccess={(added) => {
            toast.success(`${added} soal berhasil ditambahkan`);
            setAddFromBank(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
