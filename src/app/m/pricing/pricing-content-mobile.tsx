"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Check,
  X,
  Star,
  Users,
  FileText,
  ChevronDown,
  Sparkles,
  Zap,
  Crown,
  Trophy,
} from "lucide-react";
import { formatCurrency, cn } from "@/shared/lib/utils";

// --- Data ---

interface PricingPlan {
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  perMonth?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular: boolean;
  badge?: string;
  icon: React.ReactNode;
}

const creditPlans: PricingPlan[] = [
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
    href: "/m/register",
    popular: false,
    icon: <Sparkles className="size-5" strokeWidth={1.5} />,
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
    href: "/m/dashboard?plan=bundle5",
    popular: false,
    icon: <Zap className="size-5" strokeWidth={1.5} />,
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
    href: "/m/dashboard?plan=bundle10",
    popular: true,
    badge: "Paling Hemat",
    icon: <Crown className="size-5" strokeWidth={1.5} />,
  },
];

const subscriptionPlans: PricingPlan[] = [
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
    href: "/m/dashboard?plan=monthly",
    popular: false,
    icon: <Zap className="size-5" strokeWidth={1.5} />,
  },
  {
    name: "Tahunan",
    price: 999_000,
    originalPrice: 1_788_000,
    period: "/tahun",
    perMonth: "Rp 83.250/bln",
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
    href: "/m/dashboard?plan=yearly",
    popular: true,
    badge: "Hemat 44%",
    icon: <Crown className="size-5" strokeWidth={1.5} />,
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Apa itu kredit try out?",
    answer:
      "Kredit try out adalah token yang digunakan untuk mengakses satu sesi ujian. Setiap kali kamu memulai try out, 1 kredit akan digunakan. Akun baru mendapatkan 2 kredit gratis.",
  },
  {
    question: "Apakah kredit memiliki masa berlaku?",
    answer:
      "Kredit yang dibeli melalui bundle tidak memiliki masa berlaku — kamu bisa menggunakannya kapan saja. Untuk paket langganan, akses unlimited berlaku selama masa berlangganan aktif.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima berbagai metode pembayaran melalui Midtrans: transfer bank (BCA, BNI, BRI, Mandiri), e-wallet (GoPay, OVO, DANA, ShopeePay), kartu kredit/debit, dan gerai retail (Alfamart, Indomaret).",
  },
  {
    question: "Bisakah saya upgrade dari bundle ke langganan?",
    answer:
      "Tentu! Kamu bisa upgrade kapan saja. Kredit yang sudah dibeli tetap tersimpan di akunmu, dan langganan memberikan akses unlimited tambahan selama masa aktif.",
  },
  {
    question: "Apakah ada kebijakan refund?",
    answer:
      "Kredit yang sudah digunakan tidak dapat di-refund. Untuk kredit yang belum digunakan, silakan hubungi tim support kami dalam 7 hari setelah pembelian untuk proses refund.",
  },
  {
    question: "Apakah pembahasan tersedia untuk semua soal?",
    answer:
      "Ya! Setiap soal di Toutopia dilengkapi dengan pembahasan lengkap yang bisa kamu akses setelah menyelesaikan try out. Ini berlaku untuk semua paket, termasuk paket gratis.",
  },
  {
    question: "Bagaimana cara membatalkan langganan?",
    answer:
      "Kamu bisa membatalkan langganan kapan saja melalui halaman pengaturan akun. Setelah dibatalkan, akses unlimited tetap berlaku hingga akhir periode yang sudah dibayar.",
  },
];

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Anisa Putri",
    role: "Mahasiswi UI — UTBK 2025",
    content:
      "Soal-soalnya berkualitas dan pembahasannya detail banget. Skor UTBK saya naik 120 poin setelah latihan di Toutopia selama 2 bulan!",
    rating: 5,
  },
  {
    name: "Rizky Pratama",
    role: "Lolos CPNS 2025",
    content:
      "Fitur analitiknya membantu saya tahu kelemahan di mana. Akhirnya lolos CPNS di pilihan pertama. Highly recommended!",
    rating: 5,
  },
  {
    name: "Dina Maharani",
    role: "Lolos BUMN 2025",
    content:
      "Harganya worth it banget dibanding bimbel offline. Study planner-nya bikin belajar lebih terstruktur dan fokus.",
    rating: 5,
  },
];

// --- Components ---

function MobilePricingCard({ plan }: { plan: PricingPlan }): React.ReactElement {
  return (
    <Card
      className={cn(
        "relative",
        plan.popular && "border-primary shadow-lg shadow-primary/10"
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 right-4">
          <Badge className="shadow-sm">{plan.badge}</Badge>
        </div>
      )}
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {plan.icon}
          <CardTitle className="text-base">{plan.name}</CardTitle>
        </div>
        <div className="mt-3">
          {plan.originalPrice && (
            <div className="mb-0.5">
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(plan.originalPrice)}
              </span>
            </div>
          )}
          <span className="text-2xl font-bold tracking-tight">
            {plan.price === 0 ? "Rp 0" : formatCurrency(plan.price)}
          </span>
          {plan.period && (
            <span className="text-sm text-muted-foreground">{plan.period}</span>
          )}
        </div>
        {plan.perMonth && (
          <p className="text-sm font-medium text-primary">{plan.perMonth}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {plan.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check
                className="mt-0.5 size-4 shrink-0 text-emerald-500"
                strokeWidth={2}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          asChild
          className="w-full min-h-[44px]"
          variant={plan.popular ? "default" : "outline"}
          size="lg"
        >
          <Link href={plan.href}>{plan.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Main Component ---

export function MobilePricingContent(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"credit" | "subscription">(
    "credit"
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative px-4 pb-6 pt-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="text-center">
          <Badge variant="secondary" className="mb-3">
            Investasi Masa Depanmu
          </Badge>
          <h2 className="text-xl font-bold tracking-tight">
            Harga Terjangkau,{" "}
            <span className="text-primary">Kualitas Premium</span>
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Persiapan ujian terbaik dengan soal berkualitas, pembahasan lengkap,
            dan analitik pintar.
          </p>
        </div>
      </section>

      {/* Tab switcher */}
      <section className="px-4">
        <div className="mx-auto mb-5 flex max-w-sm rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("credit")}
            className={cn(
              "flex-1 rounded-md py-2.5 text-sm font-medium transition-colors min-h-[44px]",
              activeTab === "credit"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Sekali Beli
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscription")}
            className={cn(
              "flex-1 rounded-md py-2.5 text-sm font-medium transition-colors min-h-[44px]",
              activeTab === "subscription"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Langganan
          </button>
        </div>

        {/* Pricing cards - stacked vertically */}
        <div className="space-y-4">
          {(activeTab === "credit" ? creditPlans : subscriptionPlans).map(
            (plan) => (
              <MobilePricingCard key={plan.name} plan={plan} />
            )
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="mt-10 border-y bg-muted/30 py-8">
        <div className="grid grid-cols-3 gap-4 px-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1">
              <Users className="size-4 text-primary" strokeWidth={1.5} />
              <span className="text-lg font-bold">10rb+</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Siswa terdaftar
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <FileText className="size-4 text-primary" strokeWidth={1.5} />
              <span className="text-lg font-bold">50rb+</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Soal dikerjakan
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Star className="size-4 text-primary" strokeWidth={1.5} />
              <span className="text-lg font-bold">4.8/5</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Rating pengguna
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-8">
        <h3 className="mb-4 text-center text-lg font-bold">
          Apa Kata Mereka
        </h3>
        <div className="space-y-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-4">
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-3.5 fill-amber-400 text-amber-400"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-8">
        <h3 className="mb-4 text-center text-lg font-bold">
          Pertanyaan Umum
        </h3>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-lg border px-4"
            >
              <summary className="flex cursor-pointer items-center justify-between py-3.5 text-sm font-medium [&::-webkit-details-marker]:hidden list-none">
                <span className="pr-2">{faq.question}</span>
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  strokeWidth={1.5}
                />
              </summary>
              <p className="pb-3.5 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/5 via-primary/10 to-transparent" />
        <div className="text-center">
          <Trophy
            className="mx-auto mb-4 size-10 text-primary"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-bold">
            Mulai Persiapan Ujianmu Sekarang
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Bergabung dengan ribuan siswa yang sudah meraih skor impian mereka.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild size="lg" className="min-h-[44px]">
              <Link href="/m/register">Daftar Gratis</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-[44px]"
            >
              <Link href="/m/dashboard?plan=bundle10">Beli Bundle 10</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
