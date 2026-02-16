import type { Metadata } from "next";
import { CategoryLanding } from "@/shared/components/seo/category-landing";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out PPPK Online - Simulasi Tes P3K Terlengkap",
  description:
    "Latihan soal PPPK/P3K dengan simulasi tes online. Kompetensi teknis, manajerial, dan sosio-kultural lengkap.",
  keywords: [
    "tryout pppk online",
    "simulasi tes p3k",
    "soal pppk guru",
    "latihan soal pppk",
    "tes kompetensi pppk",
  ],
  openGraph: {
    title: "Try Out PPPK Online - Toutopia",
    description: "Simulasi tes PPPK/P3K online dengan soal terlengkap.",
    url: `${siteConfig.url}/tryout-pppk`,
  },
};

export default function TryoutPppkPage() {
  return (
    <CategoryLanding
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
    />
  );
}
