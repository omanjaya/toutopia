import { z } from "zod";

export const teacherApplicationSchema = z.object({
  education: z.string().min(3, "Pendidikan minimal 3 karakter"),
  specialization: z
    .array(z.string())
    .min(1, "Pilih minimal 1 spesialisasi"),
  institution: z.string().nullable().optional(),
  bio: z.string().min(20, "Bio minimal 20 karakter"),
  bankName: z.string().min(1, "Nama bank harus diisi"),
  bankAccount: z.string().min(5, "Nomor rekening minimal 5 digit"),
  bankHolder: z.string().min(3, "Nama pemilik rekening minimal 3 karakter"),
});

export const verifyTeacherSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().nullable().optional(),
});

export const payoutRequestSchema = z.object({
  amount: z.number().int().positive("Jumlah harus positif"),
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;
export type VerifyTeacherInput = z.infer<typeof verifyTeacherSchema>;
export type PayoutRequestInput = z.infer<typeof payoutRequestSchema>;
