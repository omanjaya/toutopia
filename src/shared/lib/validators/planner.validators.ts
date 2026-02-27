import { z } from "zod";

export const createPlanSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export const updatePlanSchema = createPlanSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  planId: z.string().min(1, "Plan harus dipilih"),
  title: z.string().min(1, "Judul harus diisi"),
  description: z.string().nullable().optional(),
  date: z.string().min(1, "Tanggal harus diisi"),
  startTime: z.string().nullable().optional(),
  duration: z.number().int().positive().nullable().optional(),
  priority: z.number().int().min(0).max(3).optional(),
  repeatRule: z.string().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  planId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const generatePlanSchema = z.object({
  categoryId: z.string().min(1, "Kategori ujian harus dipilih"),
  targetDate: z.string().min(1, "Tanggal ujian harus diisi"),
  hoursPerDay: z.number().int().min(1).max(4).default(2),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
