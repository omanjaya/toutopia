import { z } from "zod";

export const examSectionSchema = z.object({
  subjectId: z.string().min(1, "Subject harus dipilih"),
  title: z.string().min(1, "Judul section harus diisi"),
  durationMinutes: z.number().int().positive("Durasi harus lebih dari 0"),
  totalQuestions: z.number().int().positive("Jumlah soal harus lebih dari 0"),
  order: z.number().int().min(0),
  questionIds: z.array(z.string()).optional(),
});

export const createPackageSchema = z.object({
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  description: z.string().nullable().optional(),
  price: z.number().int().min(0, "Harga tidak boleh negatif"),
  discountPrice: z.number().int().min(0).nullable().optional(),
  durationMinutes: z.number().int().positive("Durasi harus lebih dari 0"),
  totalQuestions: z.number().int().positive("Jumlah soal harus lebih dari 0"),
  passingScore: z.number().int().nullable().optional(),
  isFree: z.boolean(),
  isAntiCheat: z.boolean(),
  maxAttempts: z.number().int().positive(),
  sections: z.array(examSectionSchema).min(1, "Minimal 1 section"),
});

export const updatePackageSchema = createPackageSchema.partial();

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
