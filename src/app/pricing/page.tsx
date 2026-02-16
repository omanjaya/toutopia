import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Check } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export const metadata: Metadata = {
  title: "Harga — Toutopia",
  description: "Pilih paket try out sesuai kebutuhanmu. Mulai dari gratis!",
};

const plans = [
  {
    name: "Gratis",
    price: 0,
    period: "",
    description: "Coba platform dengan 2 try out gratis",
    features: [
      "2 kredit try out gratis",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
    ],
    cta: "Daftar Gratis",
    href: "/register",
    popular: false,
  },
  {
    name: "Bundle 5",
    price: 99_000,
    period: "",
    description: "5 kredit try out untuk latihan intensif",
    features: [
      "5 kredit try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa",
    ],
    cta: "Beli Bundle 5",
    href: "/dashboard/payment?plan=bundle5",
    popular: false,
  },
  {
    name: "Bundle 10",
    price: 179_000,
    period: "",
    description: "10 kredit try out, hemat lebih banyak",
    features: [
      "10 kredit try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa",
      "Prioritas support",
    ],
    cta: "Beli Bundle 10",
    href: "/dashboard/payment?plan=bundle10",
    popular: true,
  },
  {
    name: "Bulanan",
    price: 149_000,
    period: "/bulan",
    description: "Akses unlimited semua try out selama 1 bulan",
    features: [
      "Unlimited try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa lengkap",
      "Prioritas support",
      "Study planner",
    ],
    cta: "Langganan Bulanan",
    href: "/dashboard/payment?plan=monthly",
    popular: false,
  },
  {
    name: "Tahunan",
    price: 999_000,
    period: "/tahun",
    description: "Hemat 44% — akses unlimited selama 1 tahun",
    features: [
      "Unlimited try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa lengkap",
      "Prioritas support",
      "Study planner",
      "Sertifikat digital",
    ],
    cta: "Langganan Tahunan",
    href: "/dashboard/payment?plan=yearly",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Harga Terjangkau untuk Masa Depanmu
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Investasi terbaik untuk persiapan ujian. Mulai gratis, upgrade
            kapan saja.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="mb-2 w-fit">Paling Populer</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? "Rp 0" : formatCurrency(plan.price)}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
