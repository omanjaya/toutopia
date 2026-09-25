import type { Metadata } from "next";
import Link from "next/link";
import { MobileLayout } from "@/app/m/mobile-layout";
import { Button } from "@/shared/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang sering diajukan seputar platform try out online Toutopia.",
};

const faqs = [
  {
    q: "Apa itu Toutopia?",
    a: "Toutopia adalah platform try out online untuk persiapan berbagai ujian seperti UTBK-SNBT, CPNS, BUMN, Kedinasan, dan PPPK. Kami menyediakan soal berkualitas, sistem anti-cheat, dan analitik performa.",
  },
  {
    q: "Apakah ada paket gratis?",
    a: "Ya! Saat mendaftar kamu mendapatkan 2 kredit try out gratis yang bisa digunakan untuk mencoba paket-paket tertentu. Kami juga menyediakan beberapa paket latihan yang sepenuhnya gratis.",
  },
  {
    q: "Bagaimana sistem kredit bekerja?",
    a: "Setiap paket try out berbayar membutuhkan 1 kredit untuk memulai. Kredit bisa dibeli dalam bentuk bundel (5 atau 10 kredit) atau melalui langganan bulanan/tahunan untuk akses tanpa batas.",
  },
  {
    q: "Berapa kali saya bisa mengerjakan satu paket?",
    a: "Setiap paket memiliki batas percobaan yang berbeda (biasanya 1–3 kali). Informasi ini tertera di halaman detail paket.",
  },
  {
    q: "Apakah soal-soalnya sesuai dengan ujian asli?",
    a: "Soal dikurasi oleh pengajar berpengalaman dan disesuaikan dengan kisi-kisi resmi terbaru. Kami juga menggunakan AI untuk membantu menjaga kualitas dan variasi soal.",
  },
  {
    q: "Apa itu sistem Anti-Cheat?",
    a: "Sistem Anti-Cheat memantau aktivitas selama ujian seperti perpindahan tab dan keluar dari layar penuh. Ini menjamin kejujuran dan validitas hasil ujian.",
  },
  {
    q: "Bagaimana cara melihat pembahasan soal?",
    a: "Setelah menyelesaikan try out, kamu bisa melihat pembahasan lengkap di halaman hasil. Kamu juga bisa mem-bookmark soal untuk review ulang nanti.",
  },
  {
    q: "Apakah saya bisa menjadi pengajar di Toutopia?",
    a: 'Ya! Kamu bisa mendaftar sebagai pengajar melalui menu "Gabung Pengajar". Setiap soal yang disetujui dan digunakan akan mendapat kompensasi.',
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami mendukung berbagai metode pembayaran melalui Midtrans, termasuk transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit.",
  },
  {
    q: "Bagaimana cara menghubungi tim support?",
    a: "Kamu bisa menghubungi kami melalui halaman Kontak atau kirim email ke support@toutopia.id. Kami akan merespons dalam 1x24 jam di hari kerja.",
  },
];

export default function MobileFAQPage() {
  return (
    <MobileLayout>
      <div className="px-4 pb-6 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">Pertanyaan Umum</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Jawaban untuk pertanyaan yang paling sering ditanyakan tentang
            Toutopia.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-0">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger className="py-4 text-left text-sm font-medium leading-snug">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still have questions */}
        <div className="mt-6 rounded-2xl border bg-muted/30 p-5 text-center">
          <p className="text-sm font-medium">Masih punya pertanyaan?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hubungi tim kami dan kami akan dengan senang hati membantu.
          </p>
          <Button asChild className="mt-4 w-full rounded-full" variant="outline">
            <Link href="/m/contact">Hubungi Kami</Link>
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
