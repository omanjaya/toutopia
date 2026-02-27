import { z } from "zod";

const promoBaseSchema = z.object({
  code: z
    .string()
    .min(3, "Kode minimal 3 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Kode hanya boleh huruf kapital, angka, - dan _"
    )
    .transform((v) => v.toUpperCase()),
  description: z.string().max(200).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().int().positive("Nilai diskon harus positif"),
  minPurchase: z.number().int().min(0).default(0),
  maxUses: z.number().int().positive("Maks penggunaan harus positif").optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const createPromoSchema = promoBaseSchema.superRefine((data, ctx) => {
  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Diskon persentase maksimal 100%",
      path: ["discountValue"],
    });
  }
});

export const updatePromoSchema = promoBaseSchema.partial();

export const applyPromoSchema = z.object({
  code: z.string().min(1, "Kode promo wajib diisi"),
  amount: z.number().int().positive("Jumlah harus positif"),
});

export type CreatePromoInput = z.infer<typeof createPromoSchema>;
export type UpdatePromoInput = z.infer<typeof updatePromoSchema>;
export type ApplyPromoInput = z.infer<typeof applyPromoSchema>;
