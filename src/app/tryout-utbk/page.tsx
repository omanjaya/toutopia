import type { Metadata } from "next";
import { CategoryLanding } from "@/shared/components/seo/category-landing";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out UTBK-SNBT Online - Simulasi Ujian Terlengkap",
  description:
    "Persiapkan UTBK-SNBT dengan try out online berkualitas. Soal terbaru, pembahasan lengkap, analitik skor, dan simulasi CAT realistis. Raih skor UTBK terbaik!",
  keywords: [
    "tryout utbk online",
    "simulasi utbk snbt",
    "latihan soal utbk",
    "try out snbt 2026",
    "soal utbk terbaru",
    "simulasi cat utbk",
  ],
  openGraph: {
    title: "Try Out UTBK-SNBT Online - Toutopia",
    description:
      "Persiapkan UTBK-SNBT dengan try out online berkualitas. Simulasi CAT realistis dengan pembahasan lengkap.",
    url: `${siteConfig.url}/tryout-utbk`,
  },
};

export default function TryoutUtbkPage() {
  return (
    <CategoryLanding
      categorySlug="utbk-snbt"
      badge="UTBK-SNBT 2026"
      title="Try Out UTBK-SNBT Online"
      subtitle="Persiapkan diri untuk UTBK-SNBT dengan simulasi ujian yang realistis. Soal berkualitas, pembahasan detail, dan analitik mendalam untuk memaksimalkan skor Anda."
      features={[
        "Soal sesuai kisi-kisi UTBK terbaru",
        "Simulasi CAT dengan timer realistis",
        "Pembahasan lengkap setiap soal",
        "Analitik skor dan ranking nasional",
        "Subtes: PU, PPU, PBM, PK, Literasi, Penalaran Matematika",
        "Anti-cheat system untuk simulasi autentik",
      ]}
      educationalLevel="SMA/SMK"
    />
  );
}
