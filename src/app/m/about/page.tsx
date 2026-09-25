import type { Metadata } from "next";
import Link from "next/link";
import { MobileLayout } from "@/app/m/mobile-layout";
import { Button } from "@/shared/components/ui/button";
import {
  Target,
  Users,
  ShieldCheck,
  BarChart3,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Toutopia adalah platform try out online terpercaya untuk persiapan UTBK, CPNS, BUMN, Kedinasan, dan PPPK.",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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

export default function MobileAboutPage() {
  return (
    <MobileLayout>
      <div className="px-4 pb-6 pt-6">
        {/* Hero */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpenCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Tentang Toutopia</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Platform try out online yang membantu kamu mempersiapkan ujian
            dengan percaya diri. Dari UTBK hingga CPNS, kami menyediakan
            simulasi ujian yang akurat, lengkap, dan terpercaya.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-6 rounded-2xl border bg-muted/30 p-5 text-center">
          <GraduationCap className="mx-auto mb-3 h-6 w-6 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Misi Kami</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Memberikan akses latihan ujian berkualitas tinggi yang terjangkau
            untuk seluruh pelajar dan pencari kerja di Indonesia. Kami percaya
            bahwa persiapan yang baik adalah kunci kesuksesan, dan setiap orang
            berhak mendapatkannya.
          </p>
        </div>

        {/* Values */}
        <h2 className="mb-4 text-base font-semibold tracking-tight">
          Kenapa Toutopia?
        </h2>
        <div className="space-y-3">
          {values.map((v) => (
            <div key={v.title} className={cardCls}>
              <div className="flex gap-4 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <v.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{v.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {v.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border bg-muted/30 p-5 text-center">
          <h2 className="text-base font-semibold tracking-tight">
            Siap Mulai Persiapan?
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Daftar sekarang dan dapatkan kredit try out gratis untuk memulai
            latihanmu.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild className="w-full rounded-full">
              <Link href="/m/register">Daftar Gratis</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/m/pricing">Lihat Paket</Link>
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
