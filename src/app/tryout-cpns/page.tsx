import type { Metadata } from "next";
import { CategoryLanding } from "@/shared/components/seo/category-landing";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out CPNS Online - Simulasi CAT BKN Terlengkap",
  description:
    "Latihan soal CPNS dengan simulasi CAT BKN online. TWK, TIU, TKP lengkap dengan pembahasan dan passing grade terbaru.",
  keywords: [
    "tryout cpns online",
    "simulasi cat bkn",
    "latihan soal cpns",
    "soal twk tiu tkp",
    "passing grade cpns",
  ],
  openGraph: {
    title: "Try Out CPNS Online - Toutopia",
    description: "Simulasi CAT BKN online dengan soal TWK, TIU, TKP terlengkap.",
    url: `${siteConfig.url}/tryout-cpns`,
  },
};

export default function TryoutCpnsPage() {
  return (
    <CategoryLanding
      categorySlug="cpns"
      badge="CPNS 2026"
      title="Try Out CPNS Online"
      subtitle="Persiapkan tes CPNS dengan simulasi CAT BKN yang realistis. Soal TWK, TIU, dan TKP sesuai standar terbaru dengan passing grade analysis."
      features={[
        "Simulasi CAT BKN realistis",
        "Soal TWK, TIU, TKP terlengkap",
        "Passing grade analysis otomatis",
        "Pembahasan detail setiap soal",
        "Timer dan anti-cheat system",
        "Ranking nasional antar peserta",
      ]}
    />
  );
}
