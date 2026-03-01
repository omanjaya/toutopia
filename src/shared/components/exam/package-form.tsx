"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Wand2, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import {
  createPackageSchema,
  type CreatePackageInput,
} from "@/shared/lib/validators/package.validators";
import { slugify } from "@/shared/lib/utils";
import {
  type ExamType,
  EXAM_TEMPLATES,
} from "@/shared/lib/exam-templates";
import { JABATAN_LIST } from "@/shared/lib/jabatan-data";

interface Category {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
    subjects: {
      id: string;
      name: string;
    }[];
  }[];
}

interface PackageFormProps {
  categories: Category[];
  initialData?: CreatePackageInput & { id?: string };
  backUrl: string;
  apiUrl: string;
}

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string }[] = [
  { value: "UTBK", label: "UTBK / SNBT" },
  { value: "CPNS", label: "CPNS SKD" },
  { value: "BUMN", label: "BUMN" },
  { value: "PPPK", label: "PPPK" },
  { value: "KEDINASAN", label: "Kedinasan" },
];

// Template section titles for badge detection
const TEMPLATE_TITLES = new Set(
  (Object.values(EXAM_TEMPLATES) as { title: string }[][])
    .flat()
    .map((s) => s.title)
);

export function PackageForm({
  categories,
  initialData,
  backUrl,
  apiUrl,
}: PackageFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [examType, setExamType] = useState<ExamType | "">(() => {
    const initial = initialData?.examType;
    return initial ?? "";
  });
  const [jabatan, setJabatan] = useState<string>(() => {
    return initialData?.jabatan ?? "";
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePackageInput>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: initialData ?? {
      categoryId: "",
      title: "",
      slug: "",
      description: null,
      price: 0,
      discountPrice: null,
      durationMinutes: 120,
      totalQuestions: 0,
      passingScore: null,
      isFree: false,
      isAntiCheat: true,
      maxAttempts: 1,
      sections: [
        {
          subjectId: "",
          title: "",
          durationMinutes: 30,
          totalQuestions: 10,
          order: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const allSubjects =
    selectedCategory?.subCategories.flatMap((sc) => sc.subjects) ?? [];

  const isFree = watch("isFree");

  function handleTitleChange(title: string) {
    setValue("title", title);
    if (!isEdit) {
      setValue("slug", slugify(title));
    }
  }

  function recalculateTotals() {
    const sections = watch("sections");
    const totalQuestions = sections.reduce(
      (sum, s) => sum + (s.totalQuestions || 0),
      0
    );
    const totalDuration = sections.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );
    setValue("totalQuestions", totalQuestions);
    setValue("durationMinutes", totalDuration);
  }

  function handleApplyTemplate() {
    if (!examType) return;

    const templates = EXAM_TEMPLATES[examType];

    // Remove all existing sections from back to front to avoid index shifting issues
    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }

    // Append template sections
    templates.forEach((tpl, idx) => {
      append({
        subjectId: "",
        title: tpl.title,
        durationMinutes: tpl.durationMinutes,
        totalQuestions: tpl.totalQuestions,
        order: idx,
      });
    });

    setTimeout(recalculateTotals, 0);

    toast.success(
      `Template ${examType} diterapkan. Pilih subject untuk setiap seksi.`
    );
  }

  async function onSubmit(data: CreatePackageInput) {
    try {
      const method = isEdit ? "PUT" : "POST";

      const body: CreatePackageInput & {
        examType?: ExamType;
        jabatan?: string;
      } = {
        ...data,
        examType: examType !== "" ? examType : undefined,
        jabatan: jabatan !== "" ? jabatan : undefined,
      };

      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal menyimpan paket");
        return;
      }

      toast.success(
        isEdit ? "Paket berhasil diperbarui" : "Paket berhasil dibuat"
      );
      router.push(backUrl);
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan paket. Silakan coba lagi.");
    }
  }

  const showJabatanField = examType === "CPNS" || examType === "PPPK";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Paket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori Ujian</Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(v) => setValue("categoryId", v)}
              >
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
              {errors.categoryId && (
                <p className="text-sm text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Judul Paket</Label>
              <Input
                placeholder="Try Out UTBK 2026 #1"
                value={watch("title")}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Slug URL</Label>
            <Input
              placeholder="try-out-utbk-2026-1"
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Deskripsi (opsional)</Label>
            <Textarea
              placeholder="Deskripsi singkat tentang paket try out ini..."
              {...register("description")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Harga & Pengaturan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={isFree}
              onCheckedChange={(v) => {
                setValue("isFree", v);
                if (v) {
                  setValue("price", 0);
                  setValue("discountPrice", null);
                }
              }}
            />
            <Label>Paket Gratis</Label>
          </div>

          {!isFree && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Harga Diskon (opsional)</Label>
                <Input
                  type="number"
                  placeholder="35000"
                  {...register("discountPrice", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Maks. Percobaan</Label>
              <Input
                type="number"
                min={1}
                {...register("maxAttempts", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Passing Score (opsional)</Label>
              <Input
                type="number"
                placeholder="600"
                {...register("passingScore", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-end gap-3 pb-1">
              <Switch
                checked={watch("isAntiCheat")}
                onCheckedChange={(v) => setValue("isAntiCheat", v)}
              />
              <Label>Anti-Cheat</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Tipe Ujian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Pilih tipe ujian untuk auto-isi section</Label>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExamType(opt.value)}
                  className={[
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    examType === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
              {examType !== "" && (
                <button
                  type="button"
                  onClick={() => {
                    setExamType("");
                    setJabatan("");
                  }}
                  className="rounded-md border border-input px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {examType !== "" && (
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Template <span className="font-semibold text-foreground">{examType}</span> tersedia dengan{" "}
                {EXAM_TEMPLATES[examType].length} section. Klik tombol di bawah untuk menerapkan.
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="ml-auto shrink-0"
                onClick={handleApplyTemplate}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Gunakan Template {examType}
              </Button>
            </div>
          )}

          {showJabatanField && (
            <div className="space-y-2">
              <Label>
                Jabatan / Formasi{" "}
                <span className="text-muted-foreground font-normal">(opsional)</span>
              </Label>
              <Select value={jabatan} onValueChange={setJabatan}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan yang dituju (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_LIST.map((jbt) => (
                    <SelectItem key={jbt.id} value={jbt.id}>
                      {jbt.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Isi jika paket ini ditujukan untuk formasi/jabatan tertentu. Pengguna dapat memfilter berdasarkan jabatan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section Ujian</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              append({
                subjectId: "",
                title: "",
                durationMinutes: 30,
                totalQuestions: 10,
                order: fields.length,
              });
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Section
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const sectionTitle = watch(`sections.${index}.title`);
            const isFromTemplate = TEMPLATE_TITLES.has(sectionTitle);

            return (
              <div
                key={field.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Section {index + 1}</p>
                    {isFromTemplate && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        dari template
                      </Badge>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => {
                        remove(index);
                        setTimeout(recalculateTotals, 0);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Judul Section</Label>
                    <Input
                      placeholder="TPS - Penalaran Umum"
                      {...register(`sections.${index}.title`)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mata Pelajaran</Label>
                    <Select
                      value={watch(`sections.${index}.subjectId`)}
                      onValueChange={(v) =>
                        setValue(`sections.${index}.subjectId`, v)
                      }
                      disabled={!selectedCategoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSubjects.map((subj) => (
                          <SelectItem key={subj.id} value={subj.id}>
                            {subj.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Jumlah Soal</Label>
                    <Input
                      type="number"
                      min={1}
                      {...register(`sections.${index}.totalQuestions`, {
                        valueAsNumber: true,
                      })}
                      onChange={(e) => {
                        setValue(
                          `sections.${index}.totalQuestions`,
                          Number(e.target.value),
                          { shouldDirty: true, shouldValidate: true }
                        );
                        recalculateTotals();
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durasi (menit)</Label>
                    <Input
                      type="number"
                      min={1}
                      {...register(`sections.${index}.durationMinutes`, {
                        valueAsNumber: true,
                      })}
                      onChange={(e) => {
                        register(`sections.${index}.durationMinutes`, {
                          valueAsNumber: true,
                        }).onChange(e);
                        setTimeout(recalculateTotals, 0);
                      }}
                    />
                  </div>
                </div>

                <input
                  type="hidden"
                  {...register(`sections.${index}.order`, {
                    valueAsNumber: true,
                  })}
                  value={index}
                />
              </div>
            );
          })}

          {errors.sections && typeof errors.sections.message === "string" && (
            <p className="text-sm text-destructive">
              {errors.sections.message}
            </p>
          )}

          {/* Summary */}
          <div className="flex gap-6 rounded-lg bg-muted p-3 text-sm">
            <div>
              Total Soal:{" "}
              <span className="font-semibold">{watch("totalQuestions")}</span>
            </div>
            <div>
              Total Durasi:{" "}
              <span className="font-semibold">
                {watch("durationMinutes")} menit
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(backUrl)}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Buat Paket"}
        </Button>
      </div>
    </form>
  );
}
