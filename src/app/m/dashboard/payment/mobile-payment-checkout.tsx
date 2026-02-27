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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

interface MobilePaymentCheckoutProps {
  currentBalance: number;
}

interface AppliedPromo {
  promoId: string;
  code: string;
  discount: number;
  finalAmount: number;
}

const plans = [
  {
    id: "bundle5",
    type: "CREDIT_BUNDLE" as const,
    bundleSize: "5" as const,
    name: "Bundle 5 Try Out",
    credits: 5,
    price: 99_000,
  },
  {
    id: "bundle10",
    type: "CREDIT_BUNDLE" as const,
    bundleSize: "10" as const,
    name: "Bundle 10 Try Out",
    credits: 10,
    price: 179_000,
    popular: true,
  },
  {
    id: "monthly",
    type: "SUBSCRIPTION" as const,
    subscriptionPlan: "MONTHLY" as const,
    name: "Langganan Bulanan",
    credits: 999,
    price: 149_000,
  },
  {
    id: "yearly",
    type: "SUBSCRIPTION" as const,
    subscriptionPlan: "YEARLY" as const,
    name: "Langganan Tahunan",
    credits: 999,
    price: 999_000,
  },
];

export function MobilePaymentCheckout({
  currentBalance,
}: MobilePaymentCheckoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedPlan = searchParams.get("plan") ?? "";
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const currentPlan = plans.find((p) => p.id === selectedPlan);
  const displayTotal = appliedPromo
    ? appliedPromo.finalAmount
    : (currentPlan?.price ?? 0);

  async function handleApplyPromo(): Promise<void> {
    if (!promoCode.trim()) return;

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) {
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
          amount: plan.price,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Kode promo tidak valid");
        return;
      }

      setAppliedPromo({
        promoId: result.data.promoId,
        code: result.data.code,
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
    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoCode("");
    }
  }

  async function handlePayment(): Promise<void> {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) {
      toast.error("Pilih paket terlebih dahulu");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: plan.type,
          bundleSize: "bundleSize" in plan ? plan.bundleSize : undefined,
          subscriptionPlan:
            "subscriptionPlan" in plan ? plan.subscriptionPlan : undefined,
          promoId: appliedPromo?.promoId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal membuat pembayaran");
        return;
      }

      const snapToken = result.data.snapToken;

      if (
        typeof window !== "undefined" &&
        (window as unknown as Record<string, unknown>).snap
      ) {
        const snap = (
          window as unknown as {
            snap: {
              pay: (
                token: string,
                options: Record<string, unknown>
              ) => void;
            };
          }
        ).snap;
        snap.pay(snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            router.push("/m/dashboard/payment/history");
            router.refresh();
          },
          onPending: () => {
            toast.info("Menunggu pembayaran...");
            router.push("/m/dashboard/payment/history");
          },
          onError: () => {
            toast.error("Pembayaran gagal");
          },
          onClose: () => {
            toast.info("Popup pembayaran ditutup");
          },
        });
      } else {
        window.location.href = result.data.redirectUrl;
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-4 px-4 pt-5 pb-32">
      {/* Current Balance */}
      <div className="rounded-xl bg-muted/50 p-3 text-center">
        <p className="text-xs text-muted-foreground">Saldo saat ini</p>
        <p className="text-lg font-bold">{currentBalance} kredit</p>
      </div>

      {/* Plan Selection — stacked for mobile */}
      <div>
        <h3 className="mb-2.5 text-sm font-semibold">Pilih Paket</h3>
        <div className="space-y-2.5">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className="w-full text-left"
            >
              <Card
                className={cn(
                  "border transition-colors",
                  selectedPlan === plan.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                )}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{plan.name}</p>
                      {"popular" in plan && plan.popular && (
                        <Badge className="text-[10px]">Populer</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {plan.credits === 999
                        ? "Unlimited try out"
                        : `${plan.credits} kredit try out`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-base font-bold">
                      {formatCurrency(plan.price)}
                    </p>
                    {selectedPlan === plan.id && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* Promo Code */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
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
                className="h-11 font-mono uppercase"
                disabled={!!appliedPromo}
              />
              <Button
                variant="outline"
                className="h-11 shrink-0"
                onClick={handleApplyPromo}
                disabled={
                  !promoCode || applyingPromo || !selectedPlan || !!appliedPromo
                }
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 active:bg-emerald-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Bottom Checkout */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Total Pembayaran</p>
          {selectedPlan ? (
            <div className="text-right">
              {appliedPromo ? (
                <div>
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(currentPlan?.price ?? 0)}
                  </p>
                  <p className="text-base font-bold text-emerald-600">
                    {formatCurrency(displayTotal)}
                  </p>
                </div>
              ) : (
                <p className="text-base font-bold">
                  {formatCurrency(displayTotal)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pilih paket</p>
          )}
        </div>
        <Button
          className="h-12 w-full text-base"
          onClick={handlePayment}
          disabled={!selectedPlan || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-5 w-5" />
          )}
          Bayar Sekarang
        </Button>
      </div>
    </div>
  );
}
