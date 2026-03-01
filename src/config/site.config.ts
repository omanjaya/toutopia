import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/shared/lib/constants";

export const siteConfig = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: APP_URL,
  ogImage: `${APP_URL}/images/og.png`,
  creator: "Toutopia",
  keywords: [
    // UTBK / SNBT
    "tryout utbk online",
    "simulasi utbk snbt",
    "latihan soal utbk 2026",
    "try out snbt online",
    // CPNS / ASN
    "latihan soal cpns",
    "simulasi cat cpns",
    "tryout cpns skd 2026",
    "soal twk tiu tkp",
    // BUMN
    "tryout bumn",
    "rekrutmen bersama bumn",
    "latihan soal bumn fhci",
    // Kedinasan
    "tryout kedinasan",
    "latihan soal stan",
    "tryout ipdn",
    // PPPK
    "latihan soal pppk",
    "simulasi seleksi pppk",
    // General
    "simulasi ujian online",
    "try out online berbayar",
    "platform tryout terbaik",
    "bank soal online",
    "pembahasan soal lengkap",
  ],
  links: {
    instagram: "https://instagram.com/toutopia.id",
    tiktok: "https://tiktok.com/@toutopia.id",
  },
} as const;
