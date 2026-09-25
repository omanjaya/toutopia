import type { Metadata } from "next";
import { MobileCategoryLanding } from "@/shared/components/seo/mobile-category-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out UTBK-SNBT Online",
  description:
    "Persiapkan UTBK-SNBT dengan try out online berkualitas. Soal terbaru, pembahasan lengkap, analitik skor, dan simulasi CAT realistis.",
};

export default function MobileTryoutUtbkPage() {
  return (
    <MobileCategoryLanding
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
      backLabel="Try Out UTBK"
    />
  );
}
