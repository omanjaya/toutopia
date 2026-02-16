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
          {pkg.sections.map((section, idx) => (
            <div key={section.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {idx + 1}. {section.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {section.subject.name} &middot; {section.totalQuestions} soal
                    &middot; {section.durationMinutes} menit
                  </p>
                </div>
                <Badge variant={
                  section.questions.length >= section.totalQuestions
                    ? "default"
                    : "outline"
                }>
                  {section.questions.length}/{section.totalQuestions} soal
                </Badge>
              </div>

              {section.questions.length > 0 && (
                <div className="space-y-1">
                  {section.questions.map((sq, qIdx) => (
                    <div
                      key={sq.question.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="w-6 text-right text-muted-foreground">
                        {qIdx + 1}.
                      </span>
                      <span className="flex-1 truncate">
                        {truncate(sq.question.content.replace(/<[^>]*>/g, ""), 60)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {difficultyLabel[sq.question.difficulty] ?? sq.question.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <div className="text-sm text-muted-foreground">
        Slug: <code className="rounded bg-muted px-1">{pkg.slug}</code>
        &middot; Maks. percobaan: {pkg.maxAttempts}x
        {pkg.passingScore && <> &middot; Passing score: {pkg.passingScore}</>}
      </div>
    </div>
  );
}
