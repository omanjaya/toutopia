"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2, Plus, Trash2, Wand2, Info,
  BookOpen, DollarSign, Layers, Save, ChevronLeft,
} from "lucide-react";
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

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string; color: string }[] = [
  { value: "UTBK",      label: "UTBK / SNBT", color: "border-blue-300 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20" },
  { value: "CPNS",      label: "CPNS SKD",    color: "border-red-300 bg-red-500/10 text-red-700 hover:bg-red-500/20" },
  { value: "BUMN",      label: "BUMN",        color: "border-emerald-300 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20" },
  { value: "PPPK",      label: "PPPK",        color: "border-orange-300 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20" },
  { value: "KEDINASAN", label: "Kedinasan",   color: "border-violet-300 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20" },
];

const EXAM_ACTIVE: Record<ExamType, string> = {
  UTBK:      "border-blue-400 bg-blue-500 text-white shadow-sm",
  CPNS:      "border-red-400 bg-red-500 text-white shadow-sm",
  BUMN:      "border-emerald-400 bg-emerald-500 text-white shadow-sm",
  PPPK:      "border-orange-400 bg-orange-500 text-white shadow-sm",
  KEDINASAN: "border-violet-400 bg-violet-500 text-white shadow-sm",
};

// Template section titles for badge detection
const TEMPLATE_TITLES = new Set(
  (Object.values(EXAM_TEMPLATES) as { title: string }[][])
    .flat()
    .map((s) => s.title)
);

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
      <div className="flex items-center gap-2">
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
      {action}
    </div>
  );
}

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
    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ── Informasi Paket ── */}
      <div className={cardCls}>
        <SectionHeader icon={BookOpen} title="Informasi Paket" description="Judul, kategori, dan deskripsi" />
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kategori Ujian</Label>
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
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Judul Paket</Label>
              <Input
                placeholder="Try Out UTBK 2026 #1"
                value={watch("title")}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Slug URL</Label>
            <Input placeholder="try-out-utbk-2026-1" {...register("slug")} />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Deskripsi{" "}
              <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Textarea
              placeholder="Deskripsi singkat tentang paket try out ini..."
              {...register("description")}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Harga & Pengaturan ── */}
      <div className={cardCls}>
        <SectionHeader icon={DollarSign} title="Harga & Pengaturan" description="Harga, percobaan, dan fitur keamanan" />
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
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
            <div>
              <p className="text-sm font-medium">Paket Gratis</p>
              <p className="text-xs text-muted-foreground">Pengguna dapat mengakses tanpa pembayaran</p>
            </div>
          </div>

          {!isFree && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Harga (Rp)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Harga Diskon{" "}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="35000"
                  {...register("discountPrice", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Maks. Percobaan</Label>
              <Input
                type="number"
                min={1}
                {...register("maxAttempts", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Passing Score{" "}
                <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                type="number"
                placeholder="600"
                {...register("passingScore", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-end gap-3 pb-0.5">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-2.5 w-full">
                <Switch
                  checked={watch("isAntiCheat")}
                  onCheckedChange={(v) => setValue("isAntiCheat", v)}
                />
                <p className="text-sm font-medium">Anti-Cheat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tipe Ujian ── */}
      <div className={cardCls}>
        <SectionHeader icon={Wand2} title="Tipe Ujian" description="Pilih tipe untuk menggunakan template section otomatis" />
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Pilih tipe ujian</p>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExamType(opt.value)}
                  className={[
                    "rounded-xl border px-4 py-2 text-xs font-semibold transition-colors",
                    examType === opt.value
                      ? EXAM_ACTIVE[opt.value]
                      : opt.color,
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
              {examType !== "" && (
                <button
                  type="button"
                  onClick={() => { setExamType(""); setJabatan(""); }}
                  className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {examType !== "" && (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <Info className="h-4 w-4 shrink-0 text-primary/70" />
              <p className="flex-1 text-sm text-muted-foreground">
                Template <span className="font-semibold text-foreground">{examType}</span> —{" "}
                {EXAM_TEMPLATES[examType].length} section tersedia
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="shrink-0"
                onClick={handleApplyTemplate}
              >
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                Gunakan Template
              </Button>
            </div>
          )}

          {showJabatanField && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Jabatan / Formasi{" "}
                <span className="font-normal text-muted-foreground">(opsional)</span>
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
                Isi jika paket ini ditujukan untuk formasi / jabatan tertentu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Section Ujian ── */}
      <div className={cardCls}>
        <SectionHeader
          icon={Layers}
          title="Section Ujian"
          description={`${fields.length} section dikonfigurasi`}
          action={
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
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Tambah Section
            </Button>
          }
        />
        <div className="space-y-3 p-5">
          {fields.map((field, index) => {
            const sectionTitle = watch(`sections.${index}.title`);
            const isFromTemplate = TEMPLATE_TITLES.has(sectionTitle);

            return (
              <div
                key={field.id}
                className="rounded-xl ring-1 ring-black/[0.06] bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold">
                      {sectionTitle || `Section ${index + 1}`}
                    </p>
                    {isFromTemplate && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-5 font-normal">
                        template
                      </Badge>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        remove(index);
                        setTimeout(recalculateTotals, 0);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Judul Section</Label>
                    <Input
                      placeholder="TPS - Penalaran Umum"
                      {...register(`sections.${index}.title`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Mata Pelajaran</Label>
                    <Select
                      value={watch(`sections.${index}.subjectId`)}
                      onValueChange={(v) =>
                        setValue(`sections.${index}.subjectId`, v)
                      }
                      disabled={!selectedCategoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCategoryId ? "Pilih subject" : "Pilih kategori dulu"} />
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Jumlah Soal</Label>
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Durasi (menit)</Label>
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
                  {...register(`sections.${index}.order`, { valueAsNumber: true })}
                  value={index}
                />
              </div>
            );
          })}

          {errors.sections && typeof errors.sections.message === "string" && (
            <p className="text-xs text-destructive">{errors.sections.message}</p>
          )}

          {/* Summary */}
          <div className="flex items-center gap-6 rounded-xl bg-muted/60 px-4 py-3 text-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Total Soal</span>
              <span className="font-bold tabular-nums">{watch("totalQuestions")}</span>
            </div>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Total Durasi</span>
              <span className="font-bold tabular-nums">{watch("durationMinutes")} menit</span>
            </div>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Section</span>
              <span className="font-bold tabular-nums">{fields.length}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => router.push(backUrl)}
        >
          <ChevronLeft className="h-4 w-4" />
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          {isEdit ? "Simpan Perubahan" : "Buat Paket"}
        </Button>
      </div>
    </form>
  );
}
