import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Harga — Toutopia",
  description:
    "Pilih paket try out sesuai kebutuhanmu. Mulai dari gratis, upgrade kapan saja.",
  openGraph: {
    title: "Harga — Toutopia",
    description:
      "Pilih paket try out sesuai kebutuhanmu. Mulai dari gratis, upgrade kapan saja.",
  },
};

export default function PricingPage(): React.ReactElement {
  return (
    <>
      <Header />
      <main>
        <PricingContent />
      </main>
      <Footer />
    </>
  );
}
