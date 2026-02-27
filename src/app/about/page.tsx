import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Target,
  Users,
  ShieldCheck,
  BarChart3,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami — Toutopia",
  description:
    "Toutopia adalah platform try out online terpercaya untuk persiapan UTBK, CPNS, BUMN, Kedinasan, dan PPPK.",
};

const values = [
  {
    icon: Target,
    title: "Akurat & Berkualitas",
    description:
      "Soal-soal dikurasi oleh pengajar berpengalaman sesuai kisi-kisi resmi ujian terbaru.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheat System",
    description:
      "Sistem pengawasan ujian menjamin kejujuran dan hasil yang valid untuk setiap peserta.",
  },
  {
    icon: BarChart3,
    title: "Analitik Mendalam",
    description:
      "Laporan performa detail membantu kamu mengenali kelemahan dan mengukur progres belajar.",
  },
  {
    icon: Users,
    title: "Komunitas Belajar",
    description:
      "Bergabung dengan ribuan peserta lain dan bandingkan performa lewat leaderboard nasional.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-16 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <BookOpenCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Tentang Toutopia
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Platform try out online yang membantu kamu mempersiapkan ujian
              dengan percaya diri. Dari UTBK hingga CPNS, kami menyediakan
              simulasi ujian yang akurat, lengkap, dan terpercaya.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl border bg-muted/30 p-8 sm:p-12 text-center">
            <GraduationCap className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Misi Kami</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Memberikan akses latihan ujian berkualitas tinggi yang terjangkau
              untuk seluruh pelajar dan pencari kerja di Indonesia. Kami percaya
              bahwa persiapan yang baik adalah kunci kesuksesan, dan setiap orang
              berhak mendapatkannya.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
            Kenapa Toutopia?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <Card key={v.title}>
                <CardContent className="flex gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {v.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Siap Mulai Persiapan?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Daftar sekarang dan dapatkan kredit try out gratis untuk memulai
              latihanmu.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/register">Daftar Gratis</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/packages">Lihat Paket</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
