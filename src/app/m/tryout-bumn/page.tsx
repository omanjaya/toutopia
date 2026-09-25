import type { Metadata } from "next";
import { MobileCategoryLanding } from "@/shared/components/seo/mobile-category-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out Rekrutmen BUMN Online",
  description:
    "Latihan soal rekrutmen bersama BUMN dengan simulasi tes online. Persiapan TKD dan core values AKHLAK BUMN.",
};

export default function MobileTryoutBumnPage() {
  return (
    <MobileCategoryLanding
      categorySlug="bumn"
      badge="Rekrutmen BUMN"
      title="Try Out Rekrutmen BUMN Online"
      subtitle="Persiapkan rekrutmen bersama BUMN dengan simulasi tes yang komprehensif. TKD dan tes core values AKHLAK."
      features={[
        "Soal TKD sesuai standar FHCI",
        "Tes core values AKHLAK BUMN",
        "Simulasi CBT realistis",
        "Pembahasan lengkap setiap soal",
        "Analitik skor dan peringkat",
        "Update soal terbaru tiap periode",
      ]}
      backLabel="Try Out BUMN"
    />
  );
}
