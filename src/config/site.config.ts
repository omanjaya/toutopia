import { APP_NAME, APP_DESCRIPTION, APP_URL } from "@/shared/lib/constants";

export const siteConfig = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: APP_URL,
  ogImage: `${APP_URL}/images/og.png`,
  creator: "Toutopia",
  keywords: [
    "tryout utbk online",
    "latihan soal cpns",
    "tryout bumn",
    "simulasi ujian online",
    "tryout kedinasan",
    "latihan soal gratis",
    "try out online berbayar",
    "simulasi cat cpns",
  ],
  links: {
    instagram: "https://instagram.com/toutopia.id",
    tiktok: "https://tiktok.com/@toutopia.id",
  },
} as const;
