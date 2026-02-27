import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MobilePricingContent } from "./pricing-content-mobile";

export const metadata: Metadata = {
  title: "Harga",
  description:
    "Pilih paket try out sesuai kebutuhanmu. Mulai dari gratis, upgrade kapan saja.",
  openGraph: {
    title: "Harga - Toutopia",
    description:
      "Pilih paket try out sesuai kebutuhanmu. Mulai dari gratis, upgrade kapan saja.",
  },
};

export default function MobilePricingPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/m"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Harga</h1>
      </div>

      <MobilePricingContent />
    </div>
  );
}
