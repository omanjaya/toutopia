"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Plus,
  Trash2,
  Wand2,
  Layers,
  DollarSign,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { type ExamType, EXAM_TEMPLATES } from "@/shared/lib/exam-templates";
import { JABATAN_LIST } from "@/shared/lib/jabatan-data";
import { formatCurrency } from "@/shared/lib/utils";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const seriesSchema = z.object({
  seriesName: z.string().min(2, "Minimal 2 karakter"),
  count: z.number().int().min(2, "Minimal 2 paket").max(20, "Maksimal 20 paket"),
  examType: z.enum(["UTBK", "CPNS", "BUMN", "PPPK", "KEDINASAN"]),
  categoryId: z.string().min(1, "Pilih kategori"),
  price: z.number().int().min(0),
  discountPrice: z.number().int().min(0).nullable().optional(),
  isFree: z.boolean(),
  isAntiCheat: z.boolean(),
  maxAttempts: z.number().int().min(1),
  passingScore: z.number().int().nullable().optional(),
  jabatan: z.string().optional(),
  sections: z
    .array(
      z.object({
        subjectId: z.string().min(1, "Pilih subject"),
        title: z.string().min(1, "Judul wajib diisi"),
        durationMinutes: z.number().int().min(1),
        totalQuestions: z.number().int().min(1),
        order: z.number().int().min(0),
      })
    )
    .min(1, "Tambahkan minimal 1 seksi"),
});

type SeriesInput = z.infer<typeof seriesSchema>;

interface SeriesCreatorFormProps {
  categories: {
    id: string;
    name: string;
    subCategories: {
      id: string;
      name: string;
      subjects: { id: string; name: string }[];
    }[];
  }[];
}

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string; color: string }[] = [
  {
    value: "UTBK",
    label: "UTBK / SNBT",
    color:
      "border-blue-300 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 data-[active=true]:border-blue-400 data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "CPNS",
    label: "CPNS SKD",
    color:
      "border-red-300 bg-red-500/10 text-red-700 hover:bg-red-500/20 data-[active=true]:border-red-400 data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "BUMN",
    label: "BUMN",
    color:
      "border-emerald-300 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 data-[active=true]:border-emerald-400 data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "PPPK",
    label: "PPPK",
    color:
      "border-orange-300 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 data-[active=true]:border-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
  {
    value: "KEDINASAN",
    label: "Kedinasan",
    color:
      "border-violet-300 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 data-[active=true]:border-violet-400 data-[active=true]:bg-violet-500 data-[active=true]:text-white data-[active=true]:shadow-sm",
  },
];

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-4">
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
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function SeriesCreatorForm({ categories }: SeriesCreatorFormProps) {
  const router = useRouter();
  const [jabatan, setJabatan] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SeriesInput>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      seriesName: "",
      count: 5,
      examType: "UTBK",
      categoryId: "",
      price: 0,
      discountPrice: null,
      isFree: false,
      isAntiCheat: true,
      maxAttempts: 1,
      passingScore: null,
      jabatan: "",
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

  const seriesName = watch("seriesName");
  const count = watch("count");
  const examType = watch("examType");
  const selectedCategoryId = watch("categoryId");
  const isFree = watch("isFree");
  const sections = watch("sections");
  const price = watch("price");

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const allSubjects =
    selectedCategory?.subCategories.flatMap((sc) => sc.subjects) ?? [];

  const showJabatanField = examType === "CPNS" || examType === "PPPK";

  const totalQuestions = sections.reduce(
    (sum, s) => sum + (s.totalQuestions || 0),
    0
  );
  const totalDuration = sections.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );

  function buildPackageNames(): string[] {
    const safeCount = Math.max(2, Math.min(20, count || 2));
    return Array.from({ length: safeCount }, (_, i) => `Paket ${seriesName} ${i + 1}`);
  }

  function handleApplyTemplate(): void {
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

    toast.success(
      `Template ${examType} diterapkan. Pilih subject untuk setiap seksi.`
    );
  }

  async function onSubmit(data: SeriesInput): Promise<void> {
    const body = {
      ...data,
      jabatan: jabatan !== "" ? jabatan : undefined,
    };

    const response = await fetch("/api/admin/packages/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = (await response.json()) as {
      success: boolean;
      error?: { message: string };
    };

    if (!response.ok) {
      toast.error(result.error?.message ?? "Gagal membuat seri paket");
      return;
    }

    toast.success(`${data.count} paket berhasil dibuat!`);
    router.push("/admin/packages");
    router.refresh();
  }

  const packageNames = buildPackageNames();
  const previewNames = packageNames.slice(0, 3);
  const remainingCount = packageNames.length - 3;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Card 1: Konfigurasi Seri */}
      <div className={cardCls}>
        <SectionHeader icon={Layers} title="Konfigurasi Seri" description="Nama seri, jumlah paket, dan tipe ujian" />
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Nama Seri</Label>
              <Input
                placeholder="SNBT, CPNS Kemenkeu, ..."
                {...register("seriesName")}
              />
              {errors.seriesName && (
                <p className="text-xs text-destructive">{errors.seriesName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Jumlah Paket</Label>
              <Input
                type="number"
                min={2}
                max={20}
                {...register("count", { valueAsNumber: true })}
              />
              {errors.count && (
                <p className="text-xs text-destructive">{errors.count.message}</p>
              )}
            </div>
          </div>

          {seriesName && count >= 2 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview nama paket</p>
              <div className="flex flex-wrap gap-2">
                {previewNames.map((name, i) => (
                  <Badge key={i} variant="secondary">
                    {name}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="outline" className="text-muted-foreground">
                    + {remainingCount} lainnya
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">Tipe Ujian</Label>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-active={examType === opt.value}
                  onClick={() => {
                    setValue("examType", opt.value);
                    if (opt.value !== "CPNS" && opt.value !== "PPPK") {
                      setJabatan("");
                    }
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.examType && (
              <p className="text-xs text-destructive">{errors.examType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Kategori Ujian</Label>
            <Select
              value={selectedCategoryId}
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

          {showJabatanField && (
            <div className="space-y-2">
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
                Isi jika seri ini ditujukan untuk formasi/jabatan tertentu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Harga & Pengaturan */}
      <div className={cardCls}>
        <SectionHeader icon={DollarSign} title="Harga &amp; Pengaturan" description="Harga, percobaan, dan fitur keamanan" />
        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Paket Gratis</p>
                <p className="text-xs text-muted-foreground">Peserta tidak perlu membayar</p>
              </div>
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
            </div>
          </div>

          {!isFree && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Harga per Paket (Rp)</Label>
                <Input
                  type="number"
                  placeholder="25000"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Harga Diskon{" "}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="20000"
                  {...register("discountPrice", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Maks. Percobaan</Label>
              <Input
                type="number"
                min={1}
                {...register("maxAttempts", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
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
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Anti-Cheat</p>
                <p className="text-xs text-muted-foreground">Deteksi pindah tab dan pelanggaran ujian</p>
              </div>
              <Switch
                checked={watch("isAntiCheat")}
                onCheckedChange={(v) => setValue("isAntiCheat", v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Struktur Seksi */}
      <div className={cardCls}>
        <SectionHeader
          icon={Wand2}
          title="Struktur Seksi"
          description="Seksi ini akan diterapkan ke semua paket dalam seri"
          action={
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleApplyTemplate}
              >
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                Template {examType}
              </Button>
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
                Tambah Seksi
              </Button>
            </>
          }
        />
        <div className="space-y-3 p-5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl ring-1 ring-black/[0.06] bg-muted/20 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold">Seksi {index + 1}</p>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Judul Seksi</Label>
                  <Input
                    placeholder="TPS - Penalaran Umum"
                    {...register(`sections.${index}.title`)}
                  />
                  {errors.sections?.[index]?.title && (
                    <p className="text-xs text-destructive">
                      {errors.sections[index]?.title?.message}
                    </p>
                  )}
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
                  {errors.sections?.[index]?.subjectId && (
                    <p className="text-xs text-destructive">
                      {errors.sections[index]?.subjectId?.message}
                    </p>
                  )}
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
                  />
                </div>
              </div>

              <input
                type="hidden"
                {...register(`sections.${index}.order`, { valueAsNumber: true })}
                value={index}
              />
            </div>
          ))}

          {errors.sections && typeof errors.sections.message === "string" && (
            <p className="text-xs text-destructive">{errors.sections.message}</p>
          )}

          <div className="flex gap-6 rounded-xl bg-muted/60 ring-1 ring-black/[0.04] p-3 text-sm">
            <div className="text-muted-foreground">
              Total Soal: <span className="font-semibold text-foreground">{totalQuestions}</span>
            </div>
            <div className="text-muted-foreground">
              Total Durasi: <span className="font-semibold text-foreground">{totalDuration} menit</span>
            </div>
            <div className="text-muted-foreground">
              Seksi: <span className="font-semibold text-foreground">{fields.length} per paket</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Preview Paket yang Akan Dibuat */}
      {seriesName && count >= 2 && sections.length > 0 && (
        <div className={cardCls}>
          <SectionHeader icon={Layers} title="Preview Paket yang Akan Dibuat" />
          <div className="p-5">
            <div className="max-h-64 overflow-y-auto rounded-xl ring-1 ring-black/[0.06]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 pl-4">#</TableHead>
                    <TableHead>Nama Paket</TableHead>
                    <TableHead>Seksi</TableHead>
                    <TableHead>Total Soal</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead className="pr-4">Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packageNames.map((name, i) => (
                    <TableRow key={i} className="hover:bg-muted/40">
                      <TableCell className="pl-4 tabular-nums text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {fields.length} seksi
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {totalQuestions} soal
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {totalDuration} menit
                      </TableCell>
                      <TableCell className="pr-4">
                        {isFree ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-xs"
                          >
                            Gratis
                          </Badge>
                        ) : (
                          <span className="font-medium tabular-nums">
                            {formatCurrency(price)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/packages")}
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buat {count >= 2 ? count : ""} Paket
        </Button>
      </div>
    </form>
  );
}
