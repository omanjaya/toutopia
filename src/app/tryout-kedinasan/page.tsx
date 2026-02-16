import type { Metadata } from "next";
import { CategoryLanding } from "@/shared/components/seo/category-landing";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out Kedinasan Online - STAN, STIS, IPDN, SSG, STIN",
  description:
    "Latihan soal seleksi kedinasan online: PKN STAN, STIS, IPDN, SSG, STIN. Simulasi tes dengan soal terbaru.",
  keywords: [
    "tryout kedinasan online",
    "simulasi tes stan",
    "soal stis",
    "tes masuk ipdn",
    "seleksi kedinasan",
  ],
  openGraph: {
    title: "Try Out Kedinasan Online - Toutopia",
    description: "Simulasi seleksi kedinasan: STAN, STIS, IPDN, SSG, STIN.",
    url: `${siteConfig.url}/tryout-kedinasan`,
  },
};

export default function TryoutKedinasanPage() {
  return (
    <CategoryLanding
      categorySlug="kedinasan"
      badge="Kedinasan"
      title="Try Out Kedinasan Online"
      subtitle="Persiapkan seleksi masuk sekolah kedinasan: PKN STAN, STIS, IPDN, SSG, STIN dengan simulasi tes komprehensif."
      features={[
        "Soal untuk semua sekolah kedinasan",
        "PKN STAN, STIS, IPDN, SSG, STIN",
        "TKD dan TBS sesuai pola terbaru",
        "Pembahasan lengkap dan tips",
        "Simulasi realistis dengan timer",
        "Perbandingan skor antar peserta",
      ]}
      educationalLevel="SMA/SMK"
    />
  );
}
