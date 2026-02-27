import { z } from "zod";

export const emailSchema = z.string().email("Email tidak valid");

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[0-9]/, "Password harus mengandung angka");

export const nameSchema = z
  .string()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama maksimal 100 karakter");

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password harus diisi"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const idSchema = z.object({
  id: z.string().cuid(),
});

export const slugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
