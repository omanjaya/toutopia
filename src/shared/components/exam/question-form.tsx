"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Tags,
  Settings,
  AlignLeft,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ImageUpload } from "@/shared/components/shared/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { LazyRichTextEditor as RichTextEditor } from "@/shared/components/shared/lazy-rich-text-editor";
import {
  createQuestionSchema,
  type CreateQuestionInput,
} from "@/shared/lib/validators/question.validators";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function SectionHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
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

interface QuestionFormProps {
  categories: Category[];
  initialData?: CreateQuestionInput & { id?: string };
  backUrl: string;
  apiUrl: string;
}

const difficultyOptions = [
  { value: "VERY_EASY", label: "Sangat Mudah" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
  { value: "VERY_HARD", label: "Sangat Sulit" },
];

const typeOptions = [
  { value: "SINGLE_CHOICE", label: "Pilihan Tunggal" },
  { value: "MULTIPLE_CHOICE", label: "Pilihan Ganda" },
  { value: "TRUE_FALSE", label: "Benar/Salah" },
  { value: "NUMERIC", label: "Numerik" },
];

const defaultOption = {
  label: "",
  content: "",
  imageUrl: null,
  isCorrect: false,
  order: 0,
};

export function QuestionForm({
  categories,
  initialData,
  backUrl,
  apiUrl,
}: QuestionFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: initialData ?? {
      topicId: "",
      type: "SINGLE_CHOICE",
      difficulty: "MEDIUM",
      content: "",
      explanation: null,
      source: null,
      year: null,
      imageUrl: null,
      options: [
        { ...defaultOption, label: "A", order: 0 },
        { ...defaultOption, label: "B", order: 1 },
        { ...defaultOption, label: "C", order: 2 },
        { ...defaultOption, label: "D", order: 3 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const questionType = watch("type");

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const currentSubCategory = currentCategory?.subCategories.find(
    (sc) => sc.id === selectedSubCategory
  );
  const currentSubject = currentSubCategory?.subjects.find(
    (s) => s.id === selectedSubject
  );

  async function onSubmit(data: CreateQuestionInput) {
    const method = isEdit ? "PATCH" : "POST";
    const response = await fetch(apiUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error?.message ?? "Gagal menyimpan soal");
      return;
    }

    toast.success(isEdit ? "Soal berhasil diperbarui" : "Soal berhasil dibuat");
    router.push(backUrl);
    router.refresh();
  }

  function handleCorrectToggle(index: number) {
    if (questionType === "SINGLE_CHOICE" || questionType === "TRUE_FALSE") {
      fields.forEach((_, i) => {
        setValue(`options.${i}.isCorrect`, i === index);
      });
    } else {
      const current = watch(`options.${index}.isCorrect`);
      setValue(`options.${index}.isCorrect`, !current);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Topic Selection */}
      <div className={cardCls}>
        <SectionHeader
          icon={Tags}
          title="Klasifikasi Soal"
          description="Tentukan kategori dan topik untuk soal ini"
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          </div>

          <div className="space-y-2">
            <Label>Sub-kategori</Label>
            <Select
              value={selectedSubCategory}
              onValueChange={setSelectedSubCategory}
              disabled={!selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih sub-kategori" />
              </SelectTrigger>
              <SelectContent>
                {currentCategory?.subCategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mata Pelajaran</Label>
            <Select
              value={selectedSubject}
              onValueChange={setSelectedSubject}
              disabled={!selectedSubCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {currentSubCategory?.subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Topik</Label>
            <Select
              value={watch("topicId")}
              onValueChange={(v) => setValue("topicId", v)}
              disabled={!selectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih topik" />
              </SelectTrigger>
              <SelectContent>
                {currentSubject?.topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.topicId && (
              <p className="text-sm text-destructive">
                {errors.topicId.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Question Properties */}
      <div className={cardCls}>
        <SectionHeader
          icon={Settings}
          title="Detail Soal"
          description="Tipe, tingkat kesulitan, dan tahun soal"
        />
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Tipe Soal</Label>
            <Select
              value={watch("type")}
              onValueChange={(v) =>
                setValue("type", v as CreateQuestionInput["type"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tingkat Kesulitan</Label>
            <Select
              value={watch("difficulty")}
              onValueChange={(v) =>
                setValue(
                  "difficulty",
                  v as CreateQuestionInput["difficulty"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tahun (opsional)</Label>
            <Input
              type="number"
              placeholder="2026"
              {...register("year", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className={cardCls}>
        <SectionHeader
          icon={AlignLeft}
          title="Konten Soal"
          description="Teks pertanyaan, sumber, dan gambar pendukung"
        />
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <Label>Pertanyaan</Label>
            <RichTextEditor
              content={watch("content")}
              onChange={(v) => setValue("content", v)}
              placeholder="Tulis pertanyaan di sini... Gunakan $formula$ untuk rumus matematika"
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Gunakan $...$ untuk rumus inline dan $$...$$ untuk rumus block
            </p>
          </div>

          <div className="space-y-2">
            <Label>Sumber (opsional)</Label>
            <Input placeholder="Contoh: UTBK 2025" {...register("source")} />
          </div>

          <div className="space-y-2">
            <Label>Gambar Soal (opsional)</Label>
            <ImageUpload
              value={watch("imageUrl")}
              onChange={(url) => setValue("imageUrl", url)}
            />
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className={cardCls}>
        <SectionHeader
          icon={ListChecks}
          title="Opsi Jawaban"
          description="Klik huruf opsi untuk menandai jawaban yang benar"
          actions={
            fields.length < 6 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    ...defaultOption,
                    label: String.fromCharCode(65 + fields.length),
                    order: fields.length,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Opsi
              </Button>
            ) : undefined
          }
        />
        <div className="space-y-4 p-5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <div className="flex items-center gap-2 pt-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => handleCorrectToggle(index)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    watch(`options.${index}.isCorrect`)
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-muted-foreground/30 text-muted-foreground hover:border-emerald-500"
                  }`}
                >
                  {watch(`options.${index}.label`) ||
                    String.fromCharCode(65 + index)}
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <Input
                  placeholder={`Isi opsi ${String.fromCharCode(65 + index)}`}
                  {...register(`options.${index}.content`)}
                />
                <ImageUpload
                  value={watch(`options.${index}.imageUrl`)}
                  onChange={(url) =>
                    setValue(`options.${index}.imageUrl`, url)
                  }
                />
                <input type="hidden" {...register(`options.${index}.label`)} />
                <input
                  type="hidden"
                  {...register(`options.${index}.order`, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.options && (
            <p className="text-sm text-destructive">
              {typeof errors.options.message === "string"
                ? errors.options.message
                : "Periksa opsi jawaban"}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Hijau = jawaban benar. Klik huruf opsi untuk mengubah status.
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className={cardCls}>
        <SectionHeader
          icon={MessageSquare}
          title="Pembahasan"
          description="Penjelasan lengkap jawaban yang benar"
        />
        <div className="p-5">
          <RichTextEditor
            content={watch("explanation") ?? ""}
            onChange={(v) => setValue("explanation", v)}
            placeholder="Tulis pembahasan soal di sini..."
          />
        </div>
      </div>

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
          {isEdit ? "Simpan Perubahan" : "Buat Soal"}
        </Button>
      </div>
    </form>
  );
}
