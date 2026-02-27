import type { Theme } from "@prisma/client";

interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  className: string;
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export const THEME_OPTIONS: ThemeConfig[] = [
  {
    id: "DEFAULT",
    name: "Biru Profesional",
    description: "Tampilan bersih dan profesional",
    className: "",
    previewColors: {
      primary: "#2563eb",
      secondary: "#e2e8f0",
      accent: "#dbeafe",
      background: "#f8fafc",
    },
  },
  {
    id: "CUTE",
    name: "Cute Pink",
    description: "Lucu dan playful dengan pastel pink",
    className: "theme-cute",
    previewColors: {
      primary: "#ec4899",
      secondary: "#fce7f3",
      accent: "#e9d5ff",
      background: "#fdf2f8",
    },
  },
  {
    id: "OCEAN",
    name: "Ocean",
    description: "Tenang dan menyegarkan seperti lautan",
    className: "theme-ocean",
    previewColors: {
      primary: "#0891b2",
      secondary: "#e0f2fe",
      accent: "#ccfbf1",
      background: "#f0f9ff",
    },
  },
  {
    id: "SUNSET",
    name: "Sunset",
    description: "Hangat dan penuh semangat",
    className: "theme-sunset",
    previewColors: {
      primary: "#ea580c",
      secondary: "#fff7ed",
      accent: "#fef3c7",
      background: "#fffbeb",
    },
  },
  {
    id: "FOREST",
    name: "Forest",
    description: "Alami dan membumi",
    className: "theme-forest",
    previewColors: {
      primary: "#16a34a",
      secondary: "#ecfdf5",
      accent: "#d1fae5",
      background: "#f0fdf4",
    },
  },
  {
    id: "NEON",
    name: "Neon",
    description: "Gelap dan vibrant, gaya techy",
    className: "theme-neon",
    previewColors: {
      primary: "#d946ef",
      secondary: "#1e1b4b",
      accent: "#06b6d4",
      background: "#0f0a1a",
    },
  },
  {
    id: "LAVENDER",
    name: "Lavender",
    description: "Lembut dan menenangkan",
    className: "theme-lavender",
    previewColors: {
      primary: "#8b5cf6",
      secondary: "#f5f3ff",
      accent: "#ede9fe",
      background: "#faf5ff",
    },
  },
];

export const THEME_MAP: Record<Theme, ThemeConfig> = Object.fromEntries(
  THEME_OPTIONS.map((t) => [t.id, t])
) as Record<Theme, ThemeConfig>;

export const DEFAULT_THEME: Theme = "DEFAULT";
