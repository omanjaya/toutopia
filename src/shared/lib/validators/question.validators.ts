import { z } from "zod";

export const questionOptionSchema = z.object({
  label: z.string().min(1),
  content: z.string().min(1, "Isi opsi tidak boleh kosong"),
  imageUrl: z.string().nullable().optional(),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
});

export const createQuestionSchema = z.object({
  topicId: z.string().min(1, "Topik harus dipilih"),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "NUMERIC"]),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  content: z.string().min(10, "Konten soal minimal 10 karakter"),
  explanation: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  options: z
    .array(questionOptionSchema)
    .min(2, "Minimal 2 opsi jawaban")
    .max(6, "Maksimal 6 opsi jawaban"),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const reviewQuestionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().nullable().optional(),
});

export const questionFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED"])
    .optional(),
  topicId: z.string().optional(),
  difficulty: z
    .enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"])
    .optional(),
  type: z
    .enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "NUMERIC"])
    .optional(),
  search: z.string().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReviewQuestionInput = z.infer<typeof reviewQuestionSchema>;
export type QuestionFilterInput = z.infer<typeof questionFilterSchema>;
