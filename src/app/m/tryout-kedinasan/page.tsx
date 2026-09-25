import type { Metadata } from "next";
import { MobileCategoryLanding } from "@/shared/components/seo/mobile-category-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try Out Kedinasan Online",
  description:
    "Latihan soal seleksi kedinasan online: PKN STAN, STIS, IPDN, SSG, STIN. Simulasi tes dengan soal terbaru.",
};

export default function MobileTryoutKedinasanPage() {
  return (
    <MobileCategoryLanding
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
      backLabel="Try Out Kedinasan"
    />
  );
}
