import type { Metadata } from "next";
import { MobileCategoryLanding } from "@/shared/components/seo/mobile-category-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out PPPK Online",
  description:
    "Latihan soal PPPK/P3K dengan simulasi tes online. Kompetensi teknis, manajerial, dan sosio-kultural lengkap.",
};

export default function MobileTryoutPppkPage() {
  return (
    <MobileCategoryLanding
      categorySlug="pppk"
      badge="PPPK/P3K"
      title="Try Out PPPK Online"
      subtitle="Persiapkan tes PPPK dengan simulasi yang komprehensif. Kompetensi teknis, manajerial, dan sosio-kultural."
      features={[
        "Soal kompetensi teknis per formasi",
        "Tes kompetensi manajerial",
        "Tes sosio-kultural lengkap",
        "Pembahasan detail setiap soal",
        "Simulasi CBT dengan timer",
        "Analitik skor per kompetensi",
      ]}
      backLabel="Try Out PPPK"
    />
  );
}
