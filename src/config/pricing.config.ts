// Shared pricing data used by both desktop and mobile pricing pages.
// The only structural difference between platforms is the href path prefix,
// which each consuming component must supply via buildPricingPlans().

export interface PricingPlanData {
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  perMonth?: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge?: string;
}

export interface ComparisonFeature {
  name: string;
  gratis: boolean | string;
  bundle: boolean | string;
  bulanan: boolean | string;
  tahunan: boolean | string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const creditPlanData: PricingPlanData[] = [
  {
    name: "Gratis",
    price: 0,
    period: "",
    description: "Coba platform dengan 2 try out gratis",
    features: [
      "2 kredit try out gratis",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
    ],
    cta: "Daftar Gratis",
    popular: false,
  },
  {
    name: "Bundle 5",
    price: 99_000,
    period: "",
    description: "5 kredit try out untuk latihan intensif",
    features: [
      "5 kredit try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa",
    ],
    cta: "Beli Bundle 5",
    popular: false,
  },
  {
    name: "Bundle 10",
    price: 179_000,
    period: "",
    description: "10 kredit try out, hemat lebih banyak",
    features: [
      "10 kredit try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa",
      "Prioritas support",
    ],
    cta: "Beli Bundle 10",
    popular: true,
    badge: "Paling Hemat",
  },
];

export const subscriptionPlanData: PricingPlanData[] = [
  {
    name: "Bulanan",
    price: 149_000,
    period: "/bulan",
    description: "Akses unlimited semua try out selama 1 bulan",
    features: [
      "Unlimited try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa lengkap",
      "Prioritas support",
      "Study planner",
    ],
    cta: "Langganan Bulanan",
    popular: false,
  },
  {
    name: "Tahunan",
    price: 999_000,
    originalPrice: 1_788_000,
    period: "/tahun",
    perMonth: "Rp83.250/bln",
    description: "Hemat 44% — akses unlimited selama 1 tahun",
    features: [
      "Unlimited try out",
      "Akses semua kategori ujian",
      "Skor dan pembahasan lengkap",
      "Leaderboard",
      "Analitik performa lengkap",
      "Prioritas support",
      "Study planner",
      "Sertifikat digital",
    ],
    cta: "Langganan Tahunan",
    popular: true,
    badge: "Hemat 44%",
  },
];

export const comparisonFeatures: ComparisonFeature[] = [
  {
    name: "Kredit Try Out",
    gratis: "2 kredit",
    bundle: "5–10 kredit",
    bulanan: "Unlimited",
    tahunan: "Unlimited",
  },
  {
    name: "Kategori Ujian",
    gratis: true,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Pembahasan Lengkap",
    gratis: true,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Leaderboard",
    gratis: true,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Analitik Performa",
    gratis: false,
    bundle: true,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Study Planner",
    gratis: false,
    bundle: false,
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Prioritas Support",
    gratis: false,
    bundle: "Bundle 10",
    bulanan: true,
    tahunan: true,
  },
  {
    name: "Sertifikat Digital",
    gratis: false,
    bundle: false,
    bulanan: false,
    tahunan: true,
  },
];

export const pricingFaqs: FaqItem[] = [
  {
    question: "Apa itu kredit try out?",
    answer:
      "Kredit try out adalah token yang digunakan untuk mengakses satu sesi ujian. Setiap kali kamu memulai try out, 1 kredit akan digunakan. Akun baru mendapatkan 2 kredit gratis.",
  },
  {
    question: "Apakah kredit memiliki masa berlaku?",
    answer:
      "Kredit yang dibeli melalui bundle tidak memiliki masa berlaku — kamu bisa menggunakannya kapan saja. Untuk paket langganan, akses unlimited berlaku selama masa berlangganan aktif.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima berbagai metode pembayaran melalui Midtrans: transfer bank (BCA, BNI, BRI, Mandiri), e-wallet (GoPay, OVO, DANA, ShopeePay), kartu kredit/debit, dan gerai retail (Alfamart, Indomaret).",
  },
  {
    question: "Bisakah saya upgrade dari bundle ke langganan?",
    answer:
      "Tentu! Kamu bisa upgrade kapan saja. Kredit yang sudah dibeli tetap tersimpan di akunmu, dan langganan memberikan akses unlimited tambahan selama masa aktif.",
  },
  {
    question: "Apakah ada kebijakan refund?",
    answer:
      "Kredit yang sudah digunakan tidak dapat di-refund. Untuk kredit yang belum digunakan, silakan hubungi tim support kami dalam 7 hari setelah pembelian untuk proses refund.",
  },
  {
    question: "Apakah pembahasan tersedia untuk semua soal?",
    answer:
      "Ya! Setiap soal di Toutopia dilengkapi dengan pembahasan lengkap yang bisa kamu akses setelah menyelesaikan try out. Ini berlaku untuk semua paket, termasuk paket gratis.",
  },
  {
    question: "Bagaimana cara membatalkan langganan?",
    answer:
      "Kamu bisa membatalkan langganan kapan saja melalui halaman pengaturan akun. Setelah dibatalkan, akses unlimited tetap berlaku hingga akhir periode yang sudah dibayar.",
  },
];
