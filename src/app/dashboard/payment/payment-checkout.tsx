"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

interface PaymentCheckoutProps {
  currentBalance: number;
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
            onClick={() => setSelectedPlan(plan.id)}
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

      {/* Checkout */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Saldo saat ini: {currentBalance} kredit
            </p>
            {selectedPlan && (
              <p className="text-lg font-semibold">
                Total:{" "}
                {formatCurrency(
                  plans.find((p) => p.id === selectedPlan)?.price ?? 0
                )}
              </p>
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
