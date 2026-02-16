import { z } from "zod";

export const createPaymentSchema = z.object({
  type: z.enum(["SINGLE_PACKAGE", "CREDIT_BUNDLE", "SUBSCRIPTION"]),
  packageId: z.string().optional(),
  bundleSize: z.enum(["5", "10"]).optional(),
  subscriptionPlan: z.enum(["MONTHLY", "YEARLY"]).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const PRICING = {
  CREDIT_BUNDLE_5: { credits: 5, price: 99_000, label: "Bundle 5 Try Out" },
  CREDIT_BUNDLE_10: { credits: 10, price: 179_000, label: "Bundle 10 Try Out" },
  SUBSCRIPTION_MONTHLY: { price: 149_000, label: "Langganan Bulanan" },
  SUBSCRIPTION_YEARLY: { price: 999_000, label: "Langganan Tahunan" },
} as const;
