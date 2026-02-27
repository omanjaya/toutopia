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
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

interface PaymentCheckoutProps {
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

export function PaymentCheckout({ currentBalance }: PaymentCheckoutProps) {
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

  async function handleApplyPromo() {
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

  function removePromo() {
    setAppliedPromo(null);
    setPromoCode("");
  }

  function handlePlanSelect(planId: string) {
    setSelectedPlan(planId);
    // Reset promo when plan changes since discount amount may differ
    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoCode("");
    }
  }

  async function handlePayment() {
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

      // Open Midtrans Snap popup
      const snapToken = result.data.snapToken;

      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).snap) {
        const snap = (window as unknown as { snap: { pay: (token: string, options: Record<string, unknown>) => void } }).snap;
        snap.pay(snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            router.push("/dashboard/payment/history");
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
      {/* Plan Selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => handlePlanSelect(plan.id)}
            className="text-left"
          >
            <Card
              className={cn(
                "transition-colors",
                selectedPlan === plan.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-muted-foreground/30"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.popular && <Badge>Populer</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(plan.price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {plan.credits === 999
                    ? "Unlimited try out"
                    : `${plan.credits} kredit try out`}
                </p>
                {selectedPlan === plan.id && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                    <Check className="h-4 w-4" />
                    Dipilih
                  </div>
                )}
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Promo Code */}
      <Card className="border-0 bg-card shadow-sm">
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
        </CardContent>
      </Card>

      {/* Checkout */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Saldo saat ini: {currentBalance} kredit
            </p>
            {selectedPlan && (
              <div>
                {appliedPromo ? (
                  <div className="space-y-0.5">
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(currentPlan?.price ?? 0)}
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
        </CardContent>
      </Card>
    </div>
  );
}
