"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  BookOpenCheck,
  Shield,
  BarChart3,
  CalendarDays,
  Users,
  Zap,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Headphones,
  Star,
  Check,
  Crown,
  Timer,
  CircleCheck,
  Circle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useGSAPAnimation } from "@/shared/hooks/use-gsap-animation";
import { getCategoryTheme } from "@/shared/lib/category-colors";
import { formatCurrency } from "@/shared/lib/utils";

const examCategories = [
  {
    title: "UTBK-SNBT",
    slug: "utbk-snbt",
    description: "Simulasi tes masuk PTN dengan standar nasional",
    href: "/tryout-utbk",
  },
  {
    title: "CPNS",
    slug: "cpns",
    description: "Latihan CAT lengkap: TWK, TIU, dan TKP",
    href: "/tryout-cpns",
  },
  {
    title: "BUMN",
    slug: "bumn",
    description: "Persiapan Rekrutmen Bersama dengan materi terkini",
    href: "/tryout-bumn",
  },
  {
    title: "Kedinasan",
    slug: "kedinasan",
    description: "Masuk STAN, STIS, IPDN, dan lainnya",
    href: "/tryout-kedinasan",
  },
  {
    title: "PPPK",
    slug: "pppk",
    description: "Kompetensi teknis dan manajerial",
    href: "/tryout-pppk",
  },
];

const features = [
  {
    title: "Simulasi Realistis",
    description: "Timer, navigasi soal, dan format ujian persis seperti aslinya.",
    icon: BookOpenCheck,
  },
  {
    title: "Anti Curang",
    description: "Mode fullscreen dan deteksi perpindahan tab untuk hasil yang jujur.",
    icon: Shield,
  },
  {
    title: "Analitik Mendalam",
    description: "Ketahui kelemahan per topik, tren skor, dan ranking peserta.",
    icon: BarChart3,
  },
  {
    title: "Study Planner",
    description: "Atur jadwal belajar dan terima reminder agar konsisten.",
    icon: CalendarDays,
  },
  {
    title: "Leaderboard",
    description: "Bersaing dengan ribuan peserta dan pantau posisimu.",
    icon: Users,
  },
  {
    title: "Pembahasan",
    description: "Setiap soal dilengkapi pembahasan detail agar benar-benar paham.",
    icon: Zap,
  },
];

const testimonials = [
  {
    name: "Aisyah P.",
    role: "Mahasiswi UI",
    tag: "Lolos UTBK 2025",
    content:
      "Fitur analitik dan pembahasan soalnya sangat detail. Skor saya naik 200 poin dalam 3 bulan!",
    score: "785/1000",
    initials: "AP",
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "Rizki P.",
    role: "PNS",
    tag: "Lolos CPNS 2025",
    content:
      "Simulasi CAT-nya persis seperti ujian asli. Timer, navigasi soal, semuanya sama. Tidak kaget saat tes.",
    score: "Passing Grade",
    initials: "RP",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Dina M.",
    role: "Karyawan BUMN",
    tag: "Lolos Rekrutmen 2025",
    content:
      "Materi AKHLAK dan TKD-nya lengkap banget. Soal-soalnya berkualitas, mirip yang keluar di tes.",
    score: "Top 5% Peserta",
    initials: "DM",
    color: "bg-emerald-100 text-emerald-700",
  },
];

const trustBadges = [
  { icon: Shield, label: "Data Terenkripsi" },
  { icon: Award, label: "Soal Terverifikasi" },
  { icon: Clock, label: "Akses 24/7" },
  { icon: Headphones, label: "Dukungan Cepat" },
];

const pricingTiers = [
  {
    name: "Gratis",
    price: 0,
    description: "Coba 2 try out gratis",
    features: ["2 kredit try out", "Semua kategori ujian", "Pembahasan lengkap"],
    cta: "Mulai Gratis",
    href: "/register",
    popular: false,
    icon: Sparkles,
  },
  {
    name: "Bundle 10",
    price: 179_000,
    description: "10 kredit, latihan intensif",
    features: ["10 kredit try out", "Analitik performa", "Prioritas support"],
    cta: "Beli Bundle",
    href: "/pricing",
    popular: true,
    badge: "Paling Hemat",
    icon: Crown,
  },
  {
    name: "Tahunan",
    price: 999_000,
    description: "Unlimited 1 tahun, hemat 44%",
    features: ["Unlimited try out", "Study planner", "Sertifikat digital"],
    cta: "Langganan",
    href: "/pricing",
    popular: false,
    icon: Award,
  },
];

interface PlatformStats {
  users: number;
  attempts: number;
  questions: number;
  packages: number;
}

function formatStatValue(value: number, suffix: string = "+"): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M${suffix}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k${suffix}`;
  }
  return `${value}${suffix}`;
}

/** Stylized exam UI mockup for the hero visual */
function ExamMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-violet-500/10 to-blue-500/10 blur-2xl" />

      {/* Main card */}
      <div className="relative rounded-2xl bg-card shadow-2xl ring-1 ring-black/[0.08] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-primary/5 border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium bg-background">
              UTBK-SNBT
            </Badge>
            <span className="text-xs text-muted-foreground">Soal 12/50</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-primary">
            <Timer className="h-3.5 w-3.5" />
            00:45:23
          </div>
        </div>

        {/* Question */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">Matematika Dasar</p>
          <p className="text-sm font-medium leading-relaxed text-foreground">
            Jika a + b = 10 dan a − b = 4, maka nilai a² + b² adalah...
          </p>
        </div>

        {/* Options */}
        <div className="px-4 pb-4 space-y-2">
          {[
            { label: "A", text: "52", selected: false },
            { label: "B", text: "58", selected: true },
            { label: "C", text: "64", selected: false },
            { label: "D", text: "72", selected: false },
          ].map((opt) => (
            <div
              key={opt.label}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                opt.selected
                  ? "border-primary/40 bg-primary/8 text-primary font-medium"
                  : "border-border/50 bg-muted/30 text-muted-foreground"
              }`}
            >
              {opt.selected ? (
                <CircleCheck className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span>
                <span className="font-medium mr-2">{opt.label}.</span>
                {opt.text}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2.5">
          <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">
            ← Sebelumnya
          </button>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((n) => (
              <div
                key={n}
                className={`h-1.5 w-1.5 rounded-full ${n === 2 ? "bg-primary" : n < 2 ? "bg-primary/40" : "bg-muted-foreground/20"}`}
              />
            ))}
          </div>
          <button className="text-xs font-medium text-primary px-2 py-1">
            Berikutnya →
          </button>
        </div>
      </div>

      {/* Floating score card */}
      <div className="absolute -bottom-4 -left-4 rounded-xl bg-card shadow-lg ring-1 ring-black/[0.06] px-3 py-2.5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground leading-none mb-0.5">Skor Kamu</p>
          <p className="text-sm font-bold text-foreground">720 / 1000</p>
        </div>
      </div>

      {/* Floating rank card */}
      <div className="absolute -top-3 -right-3 rounded-xl bg-card shadow-lg ring-1 ring-black/[0.06] px-3 py-2 flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-500" />
        <p className="text-xs font-semibold text-foreground">Rank #42</p>
      </div>
    </div>
  );
}

export function HomeContent() {
  const { scope, animateIn, animateStagger, animateHoverEnter, animateHoverLeave } =
    useGSAPAnimation();

  const [stats, setStats] = useState<{ value: string; label: string }[]>([
    { value: "12k+", label: "Pengguna Aktif" },
    { value: "10k+", label: "Soal Premium" },
    { value: "50k+", label: "Ujian Diselesaikan" },
    { value: "50+", label: "Paket Try Out" },
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/stats");
      const result = await response.json();
      if (result.success) {
        const data = result.data as PlatformStats;
        setStats([
          { value: formatStatValue(data.users), label: "Pengguna Aktif" },
          { value: formatStatValue(data.questions), label: "Soal Premium" },
          { value: formatStatValue(data.attempts), label: "Ujian Diselesaikan" },
          { value: `${data.packages}+`, label: "Paket Try Out" },
        ]);
      }
    } catch {
      // Keep default static stats on error
    }
  }, []);

  useEffect(() => {
    animateIn(".hero-item", 0.1, 0.08);
    animateStagger(".category-card", 0.5);
    animateIn(".feature-item", 0.8, 0.06);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div ref={scope} className="flex-1">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28 lg:px-8">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a78bfa] to-[#60a5fa] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-12">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="hero-item mb-6 flex justify-center lg:justify-start">
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Daftar sekarang, dapatkan 2 paket gratis
                </Badge>
              </div>

              <h1 className="hero-item text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Latihan Ujian{" "}
                <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                  Seperti Aslinya
                </span>
              </h1>

              <p className="hero-item mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground/90 lg:mx-0">
                Simulasi UTBK, CPNS, BUMN, Kedinasan & PPPK dengan soal berkualitas, timer realistis, dan analitik mendalam.
              </p>

              <div className="hero-item mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 sm:w-auto"
                  asChild
                >
                  <Link href="/register">Mulai Gratis</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 w-full rounded-full px-8 text-base text-muted-foreground hover:bg-muted/50 sm:w-auto"
                  asChild
                >
                  <Link href="/packages">
                    Lihat Paket <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="hero-item mt-8 flex items-center justify-center gap-1 lg:justify-start">
                <div className="flex -space-x-2">
                  {["AP", "RP", "DM", "BK"].map((initials, i) => (
                    <div
                      key={initials}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-2 ring-background"
                      style={{ zIndex: 4 - i }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="ml-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">12.000+</span> peserta sudah bergabung
                </p>
              </div>
            </div>

            {/* Right: UI Mockup */}
            <div className="hero-item w-full max-w-sm flex-shrink-0 lg:max-w-md">
              <ExamMockup />
            </div>
          </div>

          {/* Stats row */}
          <div className="hero-item mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border/50 sm:rounded-2xl sm:border sm:border-border/40 sm:bg-muted/20">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center rounded-xl border border-border/40 bg-muted/20 py-5 sm:rounded-none sm:border-0 sm:bg-transparent">
                <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pilih Jalur Suksesmu
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Materi terupdate sesuai kisi-kisi terbaru 2026.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examCategories.map((category) => {
              const theme = getCategoryTheme(category.slug);
              const Icon = theme.icon;
              return (
                <div key={category.href} className="group relative">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-600/20 blur opacity-0 transition duration-500 group-hover:opacity-100" />
                  <Link
                    href={category.href}
                    className="category-card relative block h-full"
                    onMouseEnter={(e) => animateHoverEnter(e.currentTarget)}
                    onMouseLeave={(e) => animateHoverLeave(e.currentTarget)}
                  >
                    <div className="flex h-full flex-col items-start rounded-2xl bg-card/60 p-7 shadow-sm ring-1 ring-black/[0.05] backdrop-blur-xl transition-all hover:shadow-md">
                      <div className={`mb-5 inline-flex rounded-xl p-3 ${theme.bg}`}>
                        <Icon className={`h-5 w-5 ${theme.text}`} />
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {category.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{category.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                        Lihat paket <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}

            {/* CTA card */}
            <div className="category-card flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary/10 to-violet-600/10 p-7 ring-1 ring-primary/15">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Tidak Yakin?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Coba 2 paket gratis tanpa kartu kredit. Mulai belajar sekarang.
                </p>
              </div>
              <Button className="mt-6 rounded-full" asChild>
                <Link href="/register">Coba Gratis <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-y border-border/40 bg-muted/20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Mulai dalam 3 Langkah
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tidak perlu ribet. Daftar, pilih paket, langsung latihan.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Daftar Gratis",
                description: "Buat akun dalam 30 detik. Langsung dapat akses ke 2 paket gratis.",
              },
              {
                step: "2",
                title: "Pilih Kategori",
                description: "UTBK, CPNS, BUMN, Kedinasan, atau PPPK — pilih sesuai target kamu.",
              },
              {
                step: "3",
                title: "Mulai Latihan",
                description: "Kerjakan soal, lihat pembahasan, dan pantau perkembangan skormu.",
              },
            ].map((item, i) => (
              <div key={item.step} className="feature-item relative text-center">
                {i < 2 && (
                  <div className="absolute left-[calc(50%+24px)] top-6 hidden h-px w-[calc(100%-48px)] bg-gradient-to-r from-primary/30 to-transparent sm:block" />
                )}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Didesain untuk Fokus
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Fitur lengkap tanpa gangguan — bantu kamu mencapai potensi maksimal.
            </p>
          </div>

          <dl className="mx-auto mt-14 grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="feature-item flex flex-col items-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                  <feature.icon className="h-6 w-6 text-foreground/80" />
                </div>
                <dt className="text-base font-semibold leading-7 text-foreground">
                  {feature.title}
                </dt>
                <dd className="mt-1 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-y border-border/40 bg-muted/20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Mereka Sudah Berhasil
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ribuan peserta membuktikan kualitas latihan di Toutopia.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="feature-item flex flex-col rounded-2xl bg-card p-7 shadow-sm ring-1 ring-black/[0.05]"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="flex-1 text-sm leading-7 text-muted-foreground">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${t.color}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.tag}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {t.score}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Teaser ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Harga Transparan
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`feature-item relative flex flex-col rounded-2xl p-7 ${
                  tier.popular
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 ring-1 ring-primary"
                    : "bg-card shadow-sm ring-1 ring-black/[0.05]"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-semibold text-amber-900">
                    {tier.badge}
                  </span>
                )}
                <div className="flex items-center gap-2.5 mb-4">
                  <tier.icon className="h-5 w-5 opacity-80" />
                  <span className="font-semibold">{tier.name}</span>
                </div>
                <div className="mb-1">
                  {tier.price === 0 ? (
                    <span className="text-3xl font-bold">Gratis</span>
                  ) : (
                    <span className="text-3xl font-bold">{formatCurrency(tier.price)}</span>
                  )}
                </div>
                <p className={`text-sm mb-5 ${tier.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {tier.description}
                </p>
                <ul className="space-y-2 mb-7 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 opacity-80" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.popular ? "secondary" : "outline"}
                  className="w-full rounded-full"
                  asChild
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Butuh lebih banyak pilihan?{" "}
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              Lihat semua paket harga
            </Link>
          </p>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-y border-border/40 bg-muted/20 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="feature-item flex items-center gap-2.5 text-muted-foreground"
              >
                <badge.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teacher CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-600/5" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Award className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Jadilah Kontributor
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Bagikan ilmu dan dapatkan penghasilan pasif. Royalti seumur hidup untuk setiap soal
            berkualitas yang Anda buat.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full px-8 hover:bg-muted/50 sm:w-auto"
              asChild
            >
              <Link href="/register?role=teacher">
                Daftar Pengajar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
