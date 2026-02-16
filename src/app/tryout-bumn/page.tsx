import type { Metadata } from "next";
import { CategoryLanding } from "@/shared/components/seo/category-landing";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out Rekrutmen BUMN Online - Simulasi Tes FHCI",
  description:
    "Latihan soal rekrutmen bersama BUMN dengan simulasi tes online. Persiapan TKD dan core values AKHLAK BUMN.",
  keywords: [
    "tryout bumn online",
    "simulasi tes bumn",
    "rekrutmen bersama bumn",
    "soal tkd bumn",
    "tes akhlak bumn",
  ],
  openGraph: {
    title: "Try Out Rekrutmen BUMN Online - Toutopia",
    description: "Simulasi tes rekrutmen bersama BUMN online.",
    url: `${siteConfig.url}/tryout-bumn`,
  },
};

export default function TryoutBumnPage() {
  return (
    <CategoryLanding
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
    />
  );
}
