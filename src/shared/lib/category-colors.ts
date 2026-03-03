import {
  GraduationCap,
  Landmark,
  Building2,
  Shield,
  FileCheck,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryTheme {
  icon: LucideIcon;
  text: string;
  bg: string;
  solid: string;
  borderAccent: string;
  ring: string;
  gradientFrom: string;
}

const categoryThemes: Record<string, CategoryTheme> = {
  utbk: {
    icon: GraduationCap,
    text: "text-blue-600",
    bg: "bg-blue-50",
    solid: "bg-blue-600 text-white",
    borderAccent: "border-blue-500",
    ring: "ring-blue-200",
    gradientFrom: "from-blue-500/15",
  },
  "utbk-snbt": {
    icon: GraduationCap,
    text: "text-blue-600",
    bg: "bg-blue-50",
    solid: "bg-blue-600 text-white",
    borderAccent: "border-blue-500",
    ring: "ring-blue-200",
    gradientFrom: "from-blue-500/15",
  },
  cpns: {
    icon: Landmark,
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    solid: "bg-emerald-600 text-white",
    borderAccent: "border-emerald-500",
    ring: "ring-emerald-200",
    gradientFrom: "from-emerald-500/15",
  },
  bumn: {
    icon: Building2,
    text: "text-amber-600",
    bg: "bg-amber-50",
    solid: "bg-amber-600 text-white",
    borderAccent: "border-amber-500",
    ring: "ring-amber-200",
    gradientFrom: "from-amber-500/15",
  },
  kedinasan: {
    icon: Shield,
    text: "text-violet-600",
    bg: "bg-violet-50",
    solid: "bg-violet-600 text-white",
    borderAccent: "border-violet-500",
    ring: "ring-violet-200",
    gradientFrom: "from-violet-500/15",
  },
  pppk: {
    icon: FileCheck,
    text: "text-rose-600",
    bg: "bg-rose-50",
    solid: "bg-rose-600 text-white",
    borderAccent: "border-rose-500",
    ring: "ring-rose-200",
    gradientFrom: "from-rose-500/15",
  },
};

const defaultTheme: CategoryTheme = {
  icon: BookOpen,
  text: "text-primary",
  bg: "bg-primary/10",
  solid: "bg-primary text-primary-foreground",
  borderAccent: "border-primary",
  ring: "ring-primary/20",
  gradientFrom: "from-primary/15",
};

export function getCategoryTheme(slug: string): CategoryTheme {
  const normalized = slug.toLowerCase().replace(/[\s_]+/g, "-");
  return categoryThemes[normalized] ?? defaultTheme;
}

export { categoryThemes, defaultTheme };
export type { CategoryTheme };
