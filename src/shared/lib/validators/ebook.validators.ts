import { z } from "zod";

const optionalUrl = z
  .string()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.string().url().nullable())
  .optional();

export const createEbookSchema = z
  .object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    slug: z
      .string()
      .min(3)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug hanya boleh huruf kecil, angka, dan tanda hubung"
      ),
    description: z.string().nullable().optional(),
    coverImage: optionalUrl,
    contentType: z.enum(["PDF", "HTML"]),
    htmlContent: z.string().nullable().optional(),
    pdfUrl: optionalUrl,
    fileSize: z.number().int().nullable().optional(),
    pageCount: z.number().int().nullable().optional(),
    category: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contentType === "HTML" && !data.htmlContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Konten HTML wajib diisi untuk tipe HTML",
        path: ["htmlContent"],
      });
    }
    if (data.contentType === "PDF" && !data.pdfUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL PDF wajib diisi untuk tipe PDF",
        path: ["pdfUrl"],
      });
    }
  });

export const updateEbookSchema = z
  .object({
    title: z.string().min(3, "Judul minimal 3 karakter").optional(),
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().nullable().optional(),
    coverImage: optionalUrl,
    contentType: z.enum(["PDF", "HTML"]).optional(),
    htmlContent: z.string().nullable().optional(),
    pdfUrl: optionalUrl,
    fileSize: z.number().int().nullable().optional(),
    pageCount: z.number().int().nullable().optional(),
    category: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.contentType === "HTML" &&
      (data.htmlContent === null || data.htmlContent === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Konten HTML wajib diisi untuk tipe HTML",
        path: ["htmlContent"],
      });
    }
    if (
      data.contentType === "PDF" &&
      (data.pdfUrl === null || data.pdfUrl === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL PDF wajib diisi untuk tipe PDF",
        path: ["pdfUrl"],
      });
    }
  });

export type CreateEbookInput = z.infer<typeof createEbookSchema>;
export type UpdateEbookInput = z.infer<typeof updateEbookSchema>;
