import { z } from "zod";

const baseFields = {
  promoCode: z.string().max(20).optional(),
};

export const createPaymentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SINGLE_PACKAGE"),
    packageId: z.string().min(1, "packageId is required"),
    ...baseFields,
  }),
  z.object({
    type: z.literal("CREDIT_BUNDLE"),
    bundleSize: z.enum(["5", "10"]),
    ...baseFields,
  }),
  z.object({
    type: z.literal("SUBSCRIPTION"),
    subscriptionPlan: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
    ...baseFields,
  }),
]);

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const PRICING = {
  CREDIT_BUNDLE_5: { credits: 5, price: 99_000, label: "Bundle 5 Try Out" },
  CREDIT_BUNDLE_10: { credits: 10, price: 179_000, label: "Bundle 10 Try Out" },
  SUBSCRIPTION_MONTHLY: { price: 149_000, label: "Langganan Bulanan" },
  SUBSCRIPTION_QUARTERLY: { price: 449_000, label: "Langganan Triwulan" },
  SUBSCRIPTION_YEARLY: { price: 999_000, label: "Langganan Tahunan" },
} as const;
