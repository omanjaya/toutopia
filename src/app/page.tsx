import Link from "next/link";
import {
  BookOpenCheck,
  Shield,
  BarChart3,
  CalendarDays,
  Users,
  Zap,
  ChevronRight,
  GraduationCap,
  Landmark,
  Building2,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";

const examCategories = [
  {
    title: "UTBK-SNBT",
    description: "Simulasi tes masuk perguruan tinggi negeri dengan soal berkualitas",
    icon: GraduationCap,
    href: "/tryout-utbk",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "CPNS",
    description: "Latihan CAT CPNS lengkap: TWK, TIU, dan TKP",
    icon: Landmark,
    href: "/tryout-cpns",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "BUMN",
    description: "Persiapan Rekrutmen Bersama BUMN dengan materi terkini",
    icon: Building2,
    href: "/tryout-bumn",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Kedinasan",
    description: "Tes masuk STAN, STIS, IPDN, dan sekolah kedinasan lainnya",
    icon: Shield,
    href: "/tryout-kedinasan",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "PPPK",
    description: "Kompetensi teknis, manajerial, dan sosio-kultural",
    icon: FileCheck,
    href: "/tryout-pppk",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

const features = [
  {
    title: "Simulasi Realistis",
    description:
      "Timer, navigasi soal, dan format ujian persis seperti aslinya. Rasakan pengalaman ujian yang sesungguhnya.",
    icon: BookOpenCheck,
  },
  {
    title: "Anti Curang",
    description:
      "Mode fullscreen dan deteksi perpindahan tab memastikan hasil yang jujur dan akurat.",
    icon: Shield,
  },
  {
    title: "Analitik Mendalam",
    description:
      "Ketahui kelemahan kamu per topik, tren skor, dan ranking dibanding peserta lain.",
    icon: BarChart3,
  },
  {
    title: "Planner Belajar",
    description:
      "Atur jadwal belajar, set target, dan terima reminder agar konsisten setiap hari.",
    icon: CalendarDays,
  },
  {
    title: "Leaderboard",
    description:
      "Bersaing dengan ribuan peserta lain. Lihat posisi kamu dan terus tingkatkan skor.",
    icon: Users,
  },
  {
    title: "Pembahasan Lengkap",
    description:
      "Setiap soal dilengkapi pembahasan detail agar kamu paham, bukan sekadar hafal.",
    icon: Zap,
  },
];

const stats = [
  { value: "50+", label: "Paket Try Out" },
  { value: "10.000+", label: "Soal Berkualitas" },
  { value: "5", label: "Kategori Ujian" },
  { value: "Gratis", label: "2 Try Out Pertama" },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">
                Dapatkan 2 try out gratis saat mendaftar
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Persiapan Ujian{" "}
                <span className="text-primary">Terbaik</span> untuk
                Masa Depanmu
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Simulasi try out online paling realistis untuk UTBK, CPNS, BUMN,
                dan lainnya. Soal berkualitas, analitik mendalam, dan fitur
                anti-curang.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Mulai Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/packages">Lihat Paket</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exam Categories */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Pilih Kategori Ujianmu
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tersedia berbagai kategori ujian dengan soal yang selalu
                diperbarui
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {examCategories.map((category) => (
                <Link key={category.href} href={category.href}>
                  <Card className="group h-full transition-all hover:shadow-md">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className={`rounded-lg p-3 ${category.bg}`}>
                        <category.icon
                          className={`h-6 w-6 ${category.color}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-primary">
                          {category.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Fitur yang Membuat Perbedaan
              </h2>
              <p className="mt-4 text-muted-foreground">
                Dirancang untuk membantu kamu mencapai skor terbaik
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Teacher */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
              <h2 className="text-3xl font-bold">Jadi Pengajar di Toutopia</h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Kontribusikan soal berkualitas dan dapatkan penghasilan. Setiap
                soal yang kamu buat akan memberikan royalti setiap kali
                digunakan siswa.
              </p>
              <Button size="lg" variant="secondary" className="mt-8" asChild>
                <Link href="/register?role=teacher">
                  Daftar sebagai Pengajar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA - Final */}
        <section className="border-t bg-muted/30 py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Siap Menaikkan Skormu?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Daftar sekarang dan dapatkan 2 try out gratis. Tanpa kartu kredit,
              tanpa komitmen.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/register">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
