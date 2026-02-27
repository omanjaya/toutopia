import { z } from "zod";

export const backupQuestionOptionSchema = z.object({
  label: z.string().min(1),
  content: z.string().min(1),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
});

export const backupQuestionSchema = z.object({
  content: z.string().min(1),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "NUMERIC"]),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  explanation: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  topicSlug: z.string().min(1),
  subjectSlug: z.string().min(1),
  subCategorySlug: z.string().min(1),
  categorySlug: z.string().min(1),
  options: z.array(backupQuestionOptionSchema).min(2).max(6),
});

export const backupFileSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  totalQuestions: z.number().int().min(0),
  questions: z.array(backupQuestionSchema),
});

export const backupRequestSchema = z.object({
  categoryId: z.string().optional(),
  topicId: z.string().optional(),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED"])
    .optional(),
  difficulty: z
    .enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"])
    .optional(),
});

export const restoreActionSchema = z.object({
  action: z.enum(["preview", "restore"]),
});

export type BackupQuestionOption = z.infer<typeof backupQuestionOptionSchema>;
export type BackupQuestion = z.infer<typeof backupQuestionSchema>;
export type BackupFile = z.infer<typeof backupFileSchema>;
export type BackupRequest = z.infer<typeof backupRequestSchema>;
