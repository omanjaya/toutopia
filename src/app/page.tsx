// Server Component — tidak ada "use client" di sini
import type { Metadata } from "next";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { HomeContent } from "./home-content";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Toutopia — Platform Try Out Online UTBK, CPNS, BUMN, Kedinasan",
  description:
    "Try out online terlengkap untuk persiapan UTBK-SNBT, CPNS SKD, BUMN, Kedinasan, dan PPPK. Soal terbaru, pembahasan lengkap, analitik skor real-time. Mulai gratis sekarang!",
  keywords: [
    "tryout utbk online",
    "simulasi cpns 2026",
    "latihan soal bumn",
    "tryout kedinasan stan",
    "soal pppk terbaru",
    "platform try out terbaik indonesia",
    "bank soal cpns terlengkap",
    "simulasi cat bkn",
  ],
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "Toutopia — Platform Try Out Online UTBK, CPNS, BUMN, Kedinasan",
    description:
      "Try out online terlengkap untuk persiapan UTBK-SNBT, CPNS SKD, BUMN, Kedinasan, dan PPPK. Mulai gratis sekarang!",
    url: siteConfig.url,
    images: [
      {
        url: "/images/og.png",
        width: 1200,
        height: 630,
        alt: "Toutopia — Platform Try Out Online",
      },
    ],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toutopia",
  url: siteConfig.url,
  description:
    "Platform try out online premium untuk UTBK, CPNS, BUMN, Kedinasan, dan PPPK",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/packages?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Toutopia",
  url: siteConfig.url,
  logo: `${siteConfig.url}/icons/icon-192x192.png`,
  description:
    "Platform try out online premium untuk persiapan ujian UTBK, CPNS, BUMN, Kedinasan, dan PPPK di Indonesia.",
  sameAs: [siteConfig.links.instagram, siteConfig.links.tiktok],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <HomeContent />
        <Footer />
      </div>
    </>
  );
}
