"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  Check,
  Tag,
  ChevronUp,
  ChevronDown,
  X,
  Crown,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";
import { Input } from "@/shared/components/ui/input";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

interface TargetPackage {
  id: string;
  title: string;
  price: number;
  totalQuestions: number;
  durationMinutes: number;
}

interface PricingData {
  creditBundles: Array<{
    id: string;
    name: string;
    credits: number;
    price: number;
    popular?: boolean;
  }>;
  subscriptions: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    plan: "MONTHLY" | "QUARTERLY" | "YEARLY";
  }>;
}

interface PaymentCheckoutProps {
  currentBalance: number;
  targetPackage?: TargetPackage;
  pricing?: PricingData;
}

interface AppliedPromo {
  code: string;
  discount: number;
  finalAmount: number;
}

interface CreditPlan {
  id: string;
  type: "CREDIT_BUNDLE";
  bundleSize: "5" | "10";
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

interface SubscriptionPlan {
  id: string;
  type: "SUBSCRIPTION";
  subscriptionPlan: "MONTHLY" | "QUARTERLY" | "YEARLY";
  name: string;
  credits: number;
  price: number;
  duration: string;
  popular?: boolean;
}

type Plan = CreditPlan | SubscriptionPlan;

const defaultCreditBundles: PricingData["creditBundles"] = [
  { id: "bundle5", name: "Bundle 5 Try Out", credits: 5, price: 99_000 },
  { id: "bundle10", name: "Bundle 10 Try Out", credits: 10, price: 179_000, popular: true },
];

const defaultSubscriptions: PricingData["subscriptions"] = [
  { id: "monthly", name: "Langganan Bulanan", price: 149_000, duration: "30 hari", plan: "MONTHLY" },
  { id: "quarterly", name: "Langganan Triwulan", price: 449_000, duration: "3 bulan", plan: "QUARTERLY" },
  { id: "yearly", name: "Langganan Tahunan", price: 999_000, duration: "1 tahun", plan: "YEARLY" },
];

const bundleSizeMap: Record<string, "5" | "10"> = {
  bundle5: "5",
  bundle10: "10",
};

function buildPlans(pricingData: PricingData): { creditPlans: CreditPlan[]; subscriptionPlans: SubscriptionPlan[]; allPlans: Plan[] } {
  const creditPlans: CreditPlan[] = pricingData.creditBundles.map((b) => ({
    id: b.id,
    type: "CREDIT_BUNDLE" as const,
    bundleSize: bundleSizeMap[b.id] ?? "5",
    name: b.name,
    credits: b.credits,
    price: b.price,
    popular: b.popular,
  }));

  const subscriptionPlans: SubscriptionPlan[] = pricingData.subscriptions.map((s) => ({
    id: s.id,
    type: "SUBSCRIPTION" as const,
    subscriptionPlan: s.plan,
    name: s.name,
    credits: 999,
    price: s.price,
    duration: s.duration,
  }));

  return { creditPlans, subscriptionPlans, allPlans: [...creditPlans, ...subscriptionPlans] };
}

export function PaymentCheckout({ currentBalance, targetPackage, pricing }: PaymentCheckoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedPlan = searchParams.get("plan") ?? (targetPackage ? "single_package" : "");
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const resolvedPricing: PricingData = pricing ?? {
    creditBundles: defaultCreditBundles,
    subscriptions: defaultSubscriptions,
  };
  const { creditPlans, subscriptionPlans, allPlans } = buildPlans(resolvedPricing);

  const currentPlan = allPlans.find((p) => p.id === selectedPlan);
  const selectedPrice = selectedPlan === "single_package"
    ? (targetPackage?.price ?? 0)
    : (currentPlan?.price ?? 0);
  const displayTotal = appliedPromo
    ? appliedPromo.finalAmount
    : selectedPrice;

  async function handleApplyPromo(): Promise<void> {
    if (!promoCode.trim()) return;

    if (!selectedPlan) {
      toast.error("Pilih paket terlebih dahulu");
      return;
    }

    const price = selectedPlan === "single_package"
      ? (targetPackage?.price ?? 0)
      : (allPlans.find((p) => p.id === selectedPlan)?.price ?? 0);

    if (price <= 0) {
      toast.error("Pilih paket terlebih dahulu");
      return;
    }

    setApplyingPromo(true);

    try {
      const response = await fetch("/api/promo/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          amount: price,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Kode promo tidak valid");
        return;
      }

      setAppliedPromo({
        code: result.data.promoCode ?? promoCode.toUpperCase(),
        discount: result.data.discount,
        finalAmount: result.data.finalAmount,
      });
      toast.success("Kode promo berhasil diterapkan");
    } catch {
      toast.error("Gagal menerapkan kode promo");
    } finally {
      setApplyingPromo(false);
    }
  }

  function removePromo(): void {
    setAppliedPromo(null);
    setPromoCode("");
  }

  function handlePlanSelect(planId: string): void {
    setSelectedPlan(planId);
    // Reset promo when plan changes since discount amount may differ
    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoCode("");
    }
  }

  async function handlePayment(): Promise<void> {
    if (!selectedPlan) {
      toast.error("Pilih paket terlebih dahulu");
      return;
    }

    setIsProcessing(true);

    try {
      let paymentBody: Record<string, unknown>;

      if (selectedPlan === "single_package" && targetPackage) {
        paymentBody = {
          type: "SINGLE_PACKAGE",
          packageId: targetPackage.id,
          promoCode: appliedPromo?.code,
        };
      } else {
        const plan = allPlans.find((p) => p.id === selectedPlan);
        if (!plan) {
          toast.error("Pilih paket terlebih dahulu");
          setIsProcessing(false);
          return;
        }
        paymentBody = {
          type: plan.type,
          bundleSize: "bundleSize" in plan ? plan.bundleSize : undefined,
          subscriptionPlan:
            "subscriptionPlan" in plan ? plan.subscriptionPlan : undefined,
          promoCode: appliedPromo?.code,
        };
      }

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentBody),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal membuat pembayaran");
        return;
      }

      const transactionId = result.data.transactionId as string | undefined;
      const successUrl = transactionId
        ? `/dashboard/payment/success?transactionId=${transactionId}`
        : "/dashboard/payment/history";

      // Handle zero-amount payment (100% promo) — already paid
      if (result.data.paid) {
        toast.success("Pembayaran berhasil! (100% diskon)");
        router.push(successUrl);
        router.refresh();
        return;
      }

      // Open Midtrans Snap popup
      const snapToken = result.data.snapToken;

      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).snap) {
        const snap = (window as unknown as { snap: { pay: (token: string, options: Record<string, unknown>) => void } }).snap;
        snap.pay(snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            router.push(successUrl);
            router.refresh();
          },
          onPending: () => {
            toast.info("Menunggu pembayaran...");
            router.push("/dashboard/payment/history");
          },
          onError: () => {
            toast.error("Pembayaran gagal");
          },
          onClose: () => {
            toast.info("Popup pembayaran ditutup");
          },
        });
      } else {
        // Fallback: redirect to Midtrans payment page
        window.location.href = result.data.redirectUrl;
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Direct Package Purchase */}
      {targetPackage && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Beli Paket Langsung</h3>
          <button
            onClick={() => handlePlanSelect("single_package")}
            className="w-full text-left"
          >
            <div
              className={cn(
                cardCls,
                "border transition-all",
                selectedPlan === "single_package"
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:ring-muted-foreground/30"
              )}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">{targetPackage.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {targetPackage.totalQuestions} soal &middot; {targetPackage.durationMinutes} menit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(targetPackage.price)}</p>
                    <p className="text-sm text-muted-foreground">Akses langsung</p>
                  </div>
                </div>
                {selectedPlan === "single_package" && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-primary">
                    <Check className="h-4 w-4" />
                    Dipilih
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Divider */}
      {targetPackage && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">atau beli kredit</span>
          </div>
        </div>
      )}

      {/* Paket Kredit (one-time) */}
      <div>
        <h3 className="text-base font-semibold tracking-tight">Paket Kredit</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Beli kredit sekali pakai. 1 kredit = 1 try out. Tidak ada batas waktu.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {creditPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className="text-left"
            >
              <div
                className={cn(
                  cardCls,
                  "transition-all",
                  selectedPlan === plan.id
                    ? "ring-primary ring-2"
                    : "hover:ring-muted-foreground/30"
                )}
              >
                <div className="px-6 pt-6 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold tracking-tight">{plan.name}</h3>
                    {plan.popular && <Badge>Populer</Badge>}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <p className="text-2xl font-bold">
                    {formatCurrency(plan.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {plan.credits} kredit try out
                  </p>
                  {selectedPlan === plan.id && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                      <Check className="h-4 w-4" />
                      Dipilih
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider between sections */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">atau langganan</span>
        </div>
      </div>

      {/* Langganan (subscription) */}
      <div>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-semibold tracking-tight">Langganan</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Akses unlimited ke semua paket selama masa aktif langganan.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className="text-left"
            >
              <div
                className={cn(
                  cardCls,
                  "transition-all",
                  selectedPlan === plan.id
                    ? "ring-primary ring-2"
                    : "hover:ring-muted-foreground/30"
                )}
              >
                <div className="px-6 pt-6 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold tracking-tight">{plan.name}</h3>
                    {plan.popular && <Badge>Populer</Badge>}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <p className="text-2xl font-bold">
                    {formatCurrency(plan.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unlimited try out
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Berlaku {plan.duration}
                  </p>
                  {selectedPlan === plan.id && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                      <Check className="h-4 w-4" />
                      Dipilih
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Promo Code */}
      <div className={cardCls}>
        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowPromo(!showPromo)}
            className="flex w-full items-center justify-between text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Punya Kode Promo?
            </span>
            {showPromo ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showPromo && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Masukkan kode promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="font-mono uppercase"
                disabled={!!appliedPromo}
              />
              <Button
                variant="outline"
                onClick={handleApplyPromo}
                disabled={!promoCode || applyingPromo || !selectedPlan || !!appliedPromo}
              >
                {applyingPromo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Terapkan"
                )}
              </Button>
            </div>
          )}

          {appliedPromo && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">
                    {appliedPromo.code} diterapkan
                  </p>
                  <p className="text-xs text-emerald-600">
                    Diskon: {formatCurrency(appliedPromo.discount)}
                  </p>
                </div>
                <button
                  onClick={removePromo}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout */}
      <div className={cardCls}>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Saldo saat ini: {currentBalance} kredit
            </p>
            {selectedPlan && (
              <div>
                {appliedPromo ? (
                  <div className="space-y-0.5">
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(selectedPrice)}
                    </p>
                    <p className="text-lg font-semibold text-emerald-600">
                      Total: {formatCurrency(displayTotal)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    Total: {formatCurrency(displayTotal)}
                  </p>
                )}
              </div>
            )}
          </div>
          <Button
            size="lg"
            onClick={handlePayment}
            disabled={!selectedPlan || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Bayar Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
