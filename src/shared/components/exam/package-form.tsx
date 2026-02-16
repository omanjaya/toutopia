"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import {
  createPackageSchema,
  type CreatePackageInput,
} from "@/shared/lib/validators/package.validators";
import { slugify } from "@/shared/lib/utils";

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

export function PackageForm({
  categories,
  initialData,
  backUrl,
  apiUrl,
}: PackageFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

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

  async function onSubmit(data: CreatePackageInput) {
    const method = isEdit ? "PUT" : "POST";
    const response = await fetch(apiUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
  }

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
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Section {index + 1}
                </p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => {
                      remove(index);
                      recalculateTotals();
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
                      register(`sections.${index}.totalQuestions`, {
                        valueAsNumber: true,
                      }).onChange(e);
                      setTimeout(recalculateTotals, 0);
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
          ))}

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
