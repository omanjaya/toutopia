import type { Metadata } from "next";
import { MobileRecommendationsContent } from "./recommendations-content";

export const metadata: Metadata = {
  title: "Rekomendasi Belajar | Toutopia",
  description: "Rekomendasi soal adaptif berdasarkan kelemahan topikmu",
};

export default function MobileRecommendationsPage() {
  return <MobileRecommendationsContent />;
}
