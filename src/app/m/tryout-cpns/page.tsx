import type { Metadata } from "next";
import { MobileCategoryLanding } from "@/shared/components/seo/mobile-category-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out CPNS Online",
  description:
    "Latihan soal CPNS dengan simulasi CAT BKN online. TWK, TIU, TKP lengkap dengan pembahasan dan passing grade terbaru.",
};

export default function MobileTryoutCpnsPage() {
  return (
    <MobileCategoryLanding
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
      backLabel="Try Out CPNS"
    />
  );
}
