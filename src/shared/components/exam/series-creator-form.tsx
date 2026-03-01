"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Wand2, Layers } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
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

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string }[] = [
  { value: "UTBK", label: "UTBK / SNBT" },
  { value: "CPNS", label: "CPNS SKD" },
  { value: "BUMN", label: "BUMN" },
  { value: "PPPK", label: "PPPK" },
  { value: "KEDINASAN", label: "Kedinasan" },
];

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Card 1: Konfigurasi Seri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Konfigurasi Seri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Seri</Label>
              <Input
                placeholder="SNBT, CPNS Kemenkeu, ..."
                {...register("seriesName")}
              />
              {errors.seriesName && (
                <p className="text-sm text-destructive">
                  {errors.seriesName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Jumlah Paket</Label>
              <Input
                type="number"
                min={2}
                max={20}
                {...register("count", { valueAsNumber: true })}
              />
              {errors.count && (
                <p className="text-sm text-destructive">
                  {errors.count.message}
                </p>
              )}
              {seriesName && count >= 2 && (
                <p className="text-xs text-muted-foreground">
                  Akan dibuat: Paket {seriesName} 1, Paket {seriesName} 2, ...
                </p>
              )}
            </div>
          </div>

          {seriesName && count >= 2 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Preview nama paket</Label>
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
            <Label>Tipe Ujian</Label>
            <div className="flex flex-wrap gap-2">
              {EXAM_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setValue("examType", opt.value);
                    if (opt.value !== "CPNS" && opt.value !== "PPPK") {
                      setJabatan("");
                    }
                  }}
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
            </div>
            {errors.examType && (
              <p className="text-sm text-destructive">{errors.examType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Kategori Ujian</Label>
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
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {showJabatanField && (
            <div className="space-y-2">
              <Label>
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
        </CardContent>
      </Card>

      {/* Card 2: Harga & Pengaturan */}
      <Card>
        <CardHeader>
          <CardTitle>Harga &amp; Pengaturan</CardTitle>
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
                <Label>Harga per Paket (Rp)</Label>
                <Input
                  type="number"
                  placeholder="25000"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Harga Diskon (opsional)</Label>
                <Input
                  type="number"
                  placeholder="20000"
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

      {/* Card 3: Struktur Seksi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Struktur Seksi</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleApplyTemplate}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Gunakan Template {examType}
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
              <Plus className="mr-2 h-4 w-4" />
              Tambah Seksi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Seksi {index + 1}</p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Judul Seksi</Label>
                  <Input
                    placeholder="TPS - Penalaran Umum"
                    {...register(`sections.${index}.title`)}
                  />
                  {errors.sections?.[index]?.title && (
                    <p className="text-sm text-destructive">
                      {errors.sections[index]?.title?.message}
                    </p>
                  )}
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
                  {errors.sections?.[index]?.subjectId && (
                    <p className="text-sm text-destructive">
                      {errors.sections[index]?.subjectId?.message}
                    </p>
                  )}
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
            <p className="text-sm text-destructive">{errors.sections.message}</p>
          )}

          <div className="flex gap-6 rounded-lg bg-muted p-3 text-sm">
            <div>
              Total Soal: <span className="font-semibold">{totalQuestions}</span>
            </div>
            <div>
              Total Durasi: <span className="font-semibold">{totalDuration} menit</span>
            </div>
            <div>
              Seksi: <span className="font-semibold">{fields.length} seksi per paket</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Preview Paket yang Akan Dibuat */}
      {seriesName && count >= 2 && sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Paket yang Akan Dibuat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Nama Paket</TableHead>
                    <TableHead>Seksi</TableHead>
                    <TableHead>Total Soal</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packageNames.map((name, i) => (
                    <TableRow key={i}>
                      <TableCell className="tabular-nums text-muted-foreground">
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
                      <TableCell>
                        {isFree ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 border-emerald-200"
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
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/packages")}
        >
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
