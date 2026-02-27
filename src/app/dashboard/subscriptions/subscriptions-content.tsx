"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Crown,
    Check,
    Loader2,
    Sparkles,
    Package,
    CreditCard,
    Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface BundlePackage {
    id: string;
    title: string;
    slug: string;
    price: number;
}

interface Bundle {
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

interface UserSubscription {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
    bundle: { name: string; slug: string };
}

interface SubscriptionData {
    bundles: Bundle[];
    userSubscriptions: UserSubscription[];
}

type PlanType = "MONTHLY" | "QUARTERLY" | "YEARLY";

export function SubscriptionsContent() {
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<PlanType>("MONTHLY");
    const [subscribing, setSubscribing] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                const res = await fetch("/api/subscriptions");
                const result = await res.json();
                if (result.success) {
                    setData(result.data as SubscriptionData);
                }
            } catch {
                toast.error("Gagal memuat data langganan");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    async function handleSubscribe(bundleId: string): Promise<void> {
        setSubscribing(bundleId);
        try {
            const res = await fetch("/api/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bundleId, plan: selectedPlan }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Berhasil berlangganan!");
                // Refresh data
                const refreshRes = await fetch("/api/subscriptions");
                const refreshResult = await refreshRes.json();
                if (refreshResult.success) setData(refreshResult.data as SubscriptionData);
            } else {
                toast.error(result.error?.message ?? "Gagal berlangganan");
            }
        } catch {
            toast.error("Gagal berlangganan");
        } finally {
            setSubscribing(null);
        }
    }

    function formatPrice(amount: number): string {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    function getPrice(bundle: Bundle, plan: PlanType): number {
        switch (plan) {
            case "MONTHLY": return bundle.monthlyPrice;
            case "QUARTERLY": return bundle.quarterlyPrice ?? bundle.monthlyPrice * 3;
            case "YEARLY": return bundle.yearlyPrice ?? bundle.monthlyPrice * 12;
        }
    }

    function getMonthlyEquivalent(bundle: Bundle, plan: PlanType): number | null {
        if (plan === "MONTHLY") return null;
        const total = getPrice(bundle, plan);
        const months = plan === "QUARTERLY" ? 3 : 12;
        return Math.round(total / months);
    }

    function getSaving(bundle: Bundle, plan: PlanType): number | null {
        if (plan === "MONTHLY") return null;
        const months = plan === "QUARTERLY" ? 3 : 12;
        const fullPrice = bundle.monthlyPrice * months;
        const planPrice = getPrice(bundle, plan);
        const saving = Math.round(((fullPrice - planPrice) / fullPrice) * 100);
        return saving > 0 ? saving : null;
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/25">
                        <Crown className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Paket Berlangganan</h1>
                <p className="text-sm text-muted-foreground">
                    Akses semua tryout dalam satu paket dengan harga lebih hemat
                </p>
            </div>

            {/* Active Subscriptions */}
            {data?.userSubscriptions && data.userSubscriptions.length > 0 && (
                <Card className="border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-emerald-700 dark:text-emerald-400">
                            <Sparkles className="h-5 w-5" />
                            Langganan Aktif
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {data.userSubscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between rounded-lg bg-white/60 p-3 dark:bg-background/30">
                                <div>
                                    <p className="text-sm font-medium">{sub.bundle.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {sub.plan} · Berlaku hingga {new Date(sub.endDate).toLocaleDateString("id-ID")}
                                    </p>
                                </div>
                                <Badge variant="default" className="bg-emerald-500">Aktif</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Plan Selector */}
            <div className="flex justify-center">
                <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
                    {([
                        { key: "MONTHLY" as const, label: "Bulanan" },
                        { key: "QUARTERLY" as const, label: "3 Bulan" },
                        { key: "YEARLY" as const, label: "Tahunan" },
                    ]).map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setSelectedPlan(key)}
                            className={cn(
                                "relative rounded-lg px-4 py-2 text-sm font-medium transition-all",
                                selectedPlan === key
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {label}
                            {key === "YEARLY" && (
                                <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    Hemat
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bundles Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {data?.bundles.map((bundle) => {
                    const price = getPrice(bundle, selectedPlan);
                    const monthlyEq = getMonthlyEquivalent(bundle, selectedPlan);
                    const saving = getSaving(bundle, selectedPlan);
                    const isSubscribed = data.userSubscriptions.some(
                        (s) => s.bundle.slug === bundle.slug
                    );

                    return (
                        <Card
                            key={bundle.id}
                            className={cn(
                                "border-0 shadow-md transition-shadow hover:shadow-lg",
                                isSubscribed && "ring-2 ring-emerald-500/50"
                            )}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold">{bundle.name}</CardTitle>
                                        {bundle.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">{bundle.description}</p>
                                        )}
                                    </div>
                                    {saving && (
                                        <Badge className="bg-emerald-500 text-white">-{saving}%</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-3xl font-bold">
                                        {formatPrice(price)}
                                    </p>
                                    {monthlyEq && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatPrice(monthlyEq)}/bulan
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Termasuk {bundle._count.packages} paket:
                                    </p>
                                    {bundle.packages.slice(0, 5).map((pkg) => (
                                        <div key={pkg.id} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            <span>{pkg.title}</span>
                                        </div>
                                    ))}
                                    {bundle.packages.length > 5 && (
                                        <p className="text-xs text-muted-foreground">
                                            +{bundle.packages.length - 5} paket lainnya
                                        </p>
                                    )}
                                </div>

                                <Button
                                    onClick={() => handleSubscribe(bundle.id)}
                                    disabled={isSubscribed || subscribing === bundle.id}
                                    className="w-full rounded-xl"
                                    variant={isSubscribed ? "outline" : "default"}
                                >
                                    {subscribing === bundle.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : isSubscribed ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Sudah Berlangganan
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Berlangganan Sekarang
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {data?.bundles.length === 0 && (
                <div className="py-12 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Belum ada paket langganan tersedia</p>
                </div>
            )}
        </div>
    );
}
