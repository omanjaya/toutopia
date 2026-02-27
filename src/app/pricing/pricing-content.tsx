"use client";

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
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
import { formatCurrency } from "@/shared/lib/utils";

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
    href: "/register",
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
    href: "/dashboard/payment?plan=bundle5",
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
    href: "/dashboard/payment?plan=bundle10",
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
    href: "/dashboard/payment?plan=monthly",
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
    href: "/dashboard/payment?plan=yearly",
    popular: true,
    badge: "Hemat 44%",
    icon: <Crown className="size-5" strokeWidth={1.5} />,
  },
];

interface ComparisonFeature {
  name: string;
  gratis: boolean | string;
  bundle: boolean | string;
  bulanan: boolean | string;
  tahunan: boolean | string;
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    name: "Kredit Try Out",
    gratis: "2 kredit",
    bundle: "5–10 kredit",
    bulanan: "Unlimited",
    tahunan: "Unlimited",
  },
  {
    name: "Kategori Ujian",
    gratis: true,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Pembahasan Lengkap",
    gratis: true,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Leaderboard",
    gratis: true,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Analitik Performa",
    gratis: false,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Study Planner",
    gratis: false,
    bundle: false,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Prioritas Support",
    gratis: false,
    bundle: "Bundle 10",
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Sertifikat Digital",
    gratis: false,
    bundle: false,
    bulanan: false,
    tahunan: true,
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

// --- Components ---

function PricingCard({ plan }: { plan: PricingPlan }): React.ReactElement {
  return (
    <Card
      className={
        plan.popular
          ? "relative border-primary shadow-lg shadow-primary/10"
          : "relative"
      }
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            {plan.icon}
            <CardTitle className="text-lg">{plan.name}</CardTitle>
          </div>
          {plan.badge && (
            <Badge className="shadow-sm">{plan.badge}</Badge>
          )}
        </div>
        <div className="mt-4">
          {plan.originalPrice && (
            <div className="mb-1">
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(plan.originalPrice)}
              </span>
            </div>
          )}
          <span className="text-3xl font-bold tracking-tight">
            {plan.price === 0 ? "Rp 0" : formatCurrency(plan.price)}
          </span>
          {plan.period && (
            <span className="text-sm text-muted-foreground">{plan.period}</span>
          )}
        </div>
        {plan.perMonth && (
          <p className="text-sm font-medium text-primary">{plan.perMonth}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {plan.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          asChild
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
          size="lg"
        >
          <Link href={plan.href}>{plan.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ComparisonCell({
  value,
}: {
  value: boolean | string;
}): React.ReactElement {
  if (typeof value === "string") {
    return <span className="text-sm font-medium">{value}</span>;
  }
  if (value) {
    return <Check className="size-5 text-emerald-500 mx-auto" strokeWidth={2} />;
  }
  return <X className="size-5 text-muted-foreground/40 mx-auto" strokeWidth={2} />;
}

// --- Main Component ---

export function PricingContent(): React.ReactElement {
  return (
    <div>
      {/* Section 1: Hero */}
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            Investasi Masa Depanmu
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Harga Terjangkau,{" "}
            <span className="text-primary">Kualitas Premium</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Persiapan ujian terbaik dengan soal berkualitas, pembahasan lengkap,
            dan analitik pintar. Mulai gratis, upgrade kapan saja.
          </p>
        </div>
      </section>

      {/* Section 2: Pricing Cards with Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="credit" className="items-center">
          <TabsList className="mx-auto mb-10">
            <TabsTrigger value="credit">Sekali Beli</TabsTrigger>
            <TabsTrigger value="subscription">Langganan</TabsTrigger>
          </TabsList>

          <TabsContent value="credit">
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {creditPlans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subscription">
            <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
              {subscriptionPlans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Section 3: Feature Comparison Table */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bandingkan Semua Fitur
          </h2>
          <p className="mt-3 text-muted-foreground">
            Lihat detail fitur yang tersedia di setiap paket
          </p>
        </div>
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-[500px] w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-4 pr-4 text-left font-medium text-muted-foreground">
                  Fitur
                </th>
                <th className="px-4 py-4 text-center font-medium">Gratis</th>
                <th className="px-4 py-4 text-center font-medium">Bundle</th>
                <th className="px-4 py-4 text-center font-medium">Bulanan</th>
                <th className="px-4 py-4 text-center font-medium">
                  <span className="flex items-center justify-center gap-1">
                    Tahunan
                    <Crown className="size-4 text-primary" strokeWidth={1.5} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature) => (
                <tr key={feature.name} className="border-b last:border-0">
                  <td className="py-4 pr-4 font-medium">{feature.name}</td>
                  <td className="px-4 py-4 text-center">
                    <ComparisonCell value={feature.gratis} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ComparisonCell value={feature.bundle} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ComparisonCell value={feature.bulanan} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ComparisonCell value={feature.tahunan} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      {/* Section 4: Trust Signals */}
      <section className="border-y bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="mx-auto mb-16 grid max-w-3xl gap-8 text-center sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-center gap-2">
                <Users className="size-5 text-primary" strokeWidth={1.5} />
                <span className="text-3xl font-bold">10.000+</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Siswa terdaftar
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <FileText className="size-5 text-primary" strokeWidth={1.5} />
                <span className="text-3xl font-bold">50.000+</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Soal dikerjakan
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <Star className="size-5 text-primary" strokeWidth={1.5} />
                <span className="text-3xl font-bold">4.8/5</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Rating pengguna
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-amber-400 text-amber-400"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pertanyaan Umum
          </h2>
          <p className="mt-3 text-muted-foreground">
            Temukan jawaban untuk pertanyaan yang sering diajukan
          </p>
        </div>
        <div className="mx-auto max-w-2xl space-y-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-lg border px-4"
            >
              <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden list-none">
                <span>{faq.question}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" strokeWidth={1.5} />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Section 6: Final CTA */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/5 via-primary/10 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Trophy className="mx-auto size-12 text-primary mb-6" strokeWidth={1.5} />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mulai Persiapan Ujianmu Sekarang
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Bergabung dengan ribuan siswa yang sudah meraih skor impian mereka.
            Daftar gratis dan dapatkan 2 kredit try out.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/register">Daftar Gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/payment?plan=bundle10">
                Beli Bundle 10
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
