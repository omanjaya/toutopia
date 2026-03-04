import {
  BookOpen,
  BarChart3,
  CalendarDays,
  Target,
} from "lucide-react";

export const ONBOARDING_STEPS = [
  { id: "welcome", title: "Selamat Datang" },
  { id: "target", title: "Target Ujian" },
  { id: "theme", title: "Pilih Tema" },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];

export const ONBOARDING_FEATURES = [
  {
    icon: BookOpen,
    title: "Try Out Online",
    description: "Simulasi ujian dengan soal berkualitas dan pembahasan lengkap",
  },
  {
    icon: BarChart3,
    title: "Analitik Performa",
    description: "Lacak perkembangan belajar dengan grafik dan statistik detail",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    description: "Buat jadwal belajar otomatis dan pantau progres harian",
  },
  {
    icon: Target,
    title: "Leaderboard",
    description:
      "Bandingkan skor dengan peserta lain dan raih peringkat terbaik",
  },
] as const;

export interface OnboardingExamCategory {
  id: string;
  name: string;
  slug: string;
}

export type OnboardingTheme =
  | "DEFAULT"
  | "CUTE"
  | "OCEAN"
  | "SUNSET"
  | "FOREST"
  | "NEON"
  | "LAVENDER";
