// Pure helpers shared between desktop and mobile subscription content components.

export interface BundlePackage {
  id: string;
  title: string;
  slug: string;
  price: number;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  quarterlyPrice: number | null;
  yearlyPrice: number | null;
  packages: BundlePackage[];
  _count: { packages: number };
}

export interface UserSubscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  bundle: { name: string; slug: string };
}

export interface SubscriptionData {
  bundles: Bundle[];
  userSubscriptions: UserSubscription[];
}

export type PlanType = "MONTHLY" | "QUARTERLY" | "YEARLY";

export function getBundlePrice(bundle: Bundle, plan: PlanType): number {
  switch (plan) {
    case "MONTHLY":
      return bundle.monthlyPrice;
    case "QUARTERLY":
      return bundle.quarterlyPrice ?? bundle.monthlyPrice * 3;
    case "YEARLY":
      return bundle.yearlyPrice ?? bundle.monthlyPrice * 12;
  }
}

export function getMonthlyEquivalent(
  bundle: Bundle,
  plan: PlanType
): number | null {
  if (plan === "MONTHLY") return null;
  const total = getBundlePrice(bundle, plan);
  const months = plan === "QUARTERLY" ? 3 : 12;
  return Math.round(total / months);
}

export function getBundleSaving(bundle: Bundle, plan: PlanType): number | null {
  if (plan === "MONTHLY") return null;
  const months = plan === "QUARTERLY" ? 3 : 12;
  const fullPrice = bundle.monthlyPrice * months;
  const planPrice = getBundlePrice(bundle, plan);
  const saving = Math.round(((fullPrice - planPrice) / fullPrice) * 100);
  return saving > 0 ? saving : null;
}

export function formatSubscriptionPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
