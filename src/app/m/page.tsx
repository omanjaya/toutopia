import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  GraduationCap,
  Landmark,
  Building2,
  Shield,
  FileCheck,
  BarChart3,
  CalendarDays,
  Users,
  Zap,
  ChevronRight,
  Sparkles,
  Award,
  Clock,
  Headphones,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

export const metadata: Metadata = {
  title: "Toutopia — Platform Tryout Online #1 Indonesia",
  description:
    "Simulasi UTBK, CPNS, BUMN, Kedinasan, dan PPPK yang realistis, akurat, dan mendalam.",
};

const examCategories = [
  {
    title: "UTBK-SNBT",
    description: "Simulasi tes masuk PTN",
    icon: GraduationCap,
    href: "/packages?category=utbk",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "CPNS",
    description: "Latihan CAT lengkap",
    icon: Landmark,
    href: "/packages?category=cpns",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "BUMN",
    description: "Rekrutmen Bersama",
    icon: Building2,
    href: "/packages?category=bumn",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Kedinasan",
    description: "STAN, STIS, IPDN",
    icon: Shield,
    href: "/packages?category=kedinasan",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "PPPK",
    description: "Kompetensi teknis",
    icon: FileCheck,
    href: "/packages?category=pppk",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

const features = [
  {
    title: "Simulasi Realistis",
    description: "Timer dan format ujian persis seperti aslinya",
    icon: BookOpenCheck,
  },
  {
    title: "Anti Curang",
    description: "Mode fullscreen dan deteksi perpindahan tab",
    icon: Shield,
  },
  {
    title: "Analitik Mendalam",
    description: "Kelemahan per topik, tren skor, dan ranking",
    icon: BarChart3,
  },
  {
    title: "Study Planner",
    description: "Atur jadwal belajar dan terima reminder",
    icon: CalendarDays,
  },
  {
    title: "Leaderboard",
    description: "Bersaing dengan ribuan peserta lainnya",
    icon: Users,
  },
  {
    title: "Pembahasan Detail",
    description: "Setiap soal dilengkapi pembahasan lengkap",
    icon: Zap,
  },
];

const stats = [
  { value: "10k+", label: "Soal Premium" },
  { value: "50+", label: "Paket Tryout" },
  { value: "5", label: "Kategori Ujian" },
  { value: "24/7", label: "Akses Kapanpun" },
];

const trustBadges = [
  { icon: Shield, label: "Data Terenkripsi" },
  { icon: Award, label: "Soal Terverifikasi" },
  { icon: Clock, label: "Akses 24/7" },
  { icon: Headphones, label: "Dukungan Cepat" },
];

export default function MobileLandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/m" className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Toutopia</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 px-3 text-sm" asChild>
              <Link href="/m/login">Masuk</Link>
            </Button>
            <Button size="sm" className="h-9 rounded-full px-4 text-sm" asChild>
              <Link href="/m/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-16">
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="mb-6 rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
            >
              <Sparkles className="mr-1.5 h-3 w-3" />
              2 paket gratis untuk pendaftar baru
            </Badge>
          </div>

          <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
            Ujian Masa Depan.{" "}
            <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              Mulai Hari Ini.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-center text-base leading-relaxed text-muted-foreground">
            Platform tryout online #1 Indonesia. Simulasi UTBK, CPNS, dan BUMN yang realistis.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/25"
              asChild
            >
              <Link href="/m/register">Mulai Tryout</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-full text-base"
              asChild
            >
              <Link href="/m/register">Daftar Gratis</Link>
            </Button>
          </div>
        </section>

        {/* Categories — horizontal scroll */}
        <section className="py-10">
          <div className="px-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Pilih Jalur Suksesmu
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Materi terupdate sesuai kisi-kisi 2026
            </p>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {examCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="flex min-w-[140px] shrink-0 flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors active:bg-muted/50"
              >
                <div className={`mb-3 inline-flex self-start rounded-xl p-2.5 ${category.bg}`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <span className="text-sm font-semibold text-foreground">{category.title}</span>
                <span className="mt-0.5 text-xs text-muted-foreground">{category.description}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats — 2x2 grid */}
        <section className="px-4 py-10">
          <div className="rounded-2xl bg-muted/40 p-6">
            <h2 className="mb-5 text-center text-lg font-semibold tracking-tight text-foreground">
              Dipercaya Ribuan Peserta
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — vertical list */}
        <section className="px-4 py-10">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Didesain untuk Fokus
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fitur lengkap untuk mencapai potensi maksimal
          </p>

          <div className="mt-6 space-y-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-xl border border-border/40 bg-card p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                  <feature.icon className="h-5 w-5 text-foreground/80" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="border-y border-border/40 bg-muted/20 px-4 py-8">
          <div className="grid grid-cols-2 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-muted-foreground">
                <badge.icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-14 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Siap Mulai Berlatih?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar sekarang dan dapatkan 2 paket tryout gratis.
          </p>
          <Button
            size="lg"
            className="mt-6 h-12 w-full rounded-full text-base shadow-lg shadow-primary/25"
            asChild
          >
            <Link href="/m/register">
              Daftar Gratis <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/10 px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Link href="/m" className="flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Toutopia</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <Link href="/about" className="py-1.5 hover:text-foreground">Tentang</Link>
            <Link href="/contact" className="py-1.5 hover:text-foreground">Kontak</Link>
            <Link href="/privacy" className="py-1.5 hover:text-foreground">Privasi</Link>
            <Link href="/terms" className="py-1.5 hover:text-foreground">Ketentuan</Link>
            <Link href="/faq" className="py-1.5 hover:text-foreground">FAQ</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Toutopia. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
