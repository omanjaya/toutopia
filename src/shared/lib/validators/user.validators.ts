import { z } from "zod";

export const themeSchema = z.enum([
  "DEFAULT",
  "CUTE",
  "OCEAN",
  "SUNSET",
  "FOREST",
  "NEON",
  "LAVENDER",
]);

export const updateThemeSchema = z.object({
  theme: themeSchema,
});

export const completeOnboardingSchema = z.object({
  theme: themeSchema.optional(),
  targetExam: z.string().max(100).optional(),
});

export type ThemeValue = z.infer<typeof themeSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
