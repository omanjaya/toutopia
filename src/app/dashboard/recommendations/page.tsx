import { Metadata } from "next";
import { RecommendationsContent } from "./recommendations-content";

export const metadata: Metadata = {
    title: "Rekomendasi Belajar | Toutopia",
    description: "Rekomendasi soal adaptif berdasarkan kelemahan topikmu",
};

export default function RecommendationsPage() {
    return <RecommendationsContent />;
}
