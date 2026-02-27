"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Palette,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { ThemePicker } from "@/shared/components/theme/theme-picker";
import type { Theme } from "@prisma/client";

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
}

const STEPS = [
  { id: "welcome", title: "Selamat Datang" },
  { id: "target", title: "Target Ujian" },
  { id: "theme", title: "Pilih Tema" },
] as const;

const FEATURES = [
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
];

export function MobileOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [targetExam, setTargetExam] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Theme>("DEFAULT");

  // Categories
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (step === 1 && categories.length === 0) {
      setLoadingCategories(true);
      fetch("/api/categories")
        .then((res) => res.json())
        .then((result) => {
          if (result.data) setCategories(result.data);
        })
        .catch(() => {})
        .finally(() => setLoadingCategories(false));
    }
  }, [step, categories.length]);

  function nextStep(): void {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function prevStep(): void {
    if (step > 0) setStep(step - 1);
  }

  async function completeOnboarding(): Promise<void> {
    setSaving(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: selectedTheme,
          targetExam: targetExam || undefined,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error?.message ?? "Gagal menyimpan");
        return;
      }

      toast.success("Selamat datang di Toutopia!");
      router.push("/m/dashboard");
    } finally {
      setSaving(false);
    }
  }

  async function skipToEnd(): Promise<void> {
    setSaving(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: "DEFAULT" }),
      });

      if (res.ok) {
        router.push("/m/dashboard");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pb-8 pt-12">
      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-2 rounded-full transition-all",
              i === step ? "w-10 bg-primary" : "w-2 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex flex-1 flex-col">
        {/* Step 1: Welcome / Feature Tour */}
        {step === 0 && (
          <div className="flex flex-1 flex-col">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Selamat datang di Toutopia!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Platform persiapan ujian terlengkap. Kenali fitur-fitur utama
                kami:
              </p>
            </div>

            <div className="space-y-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex gap-3 rounded-xl border p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex items-center justify-between pt-8">
              <Button
                variant="ghost"
                onClick={skipToEnd}
                disabled={saving}
                className="h-12 text-base"
              >
                Lewati
              </Button>
              <Button
                onClick={nextStep}
                className="h-12 rounded-xl px-6 text-base"
              >
                Lanjut
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Target Exam */}
        {step === 1 && (
          <div className="flex flex-1 flex-col">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Target Ujian Kamu
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Pilih ujian yang sedang kamu persiapkan (bisa diubah nanti)
              </p>
            </div>

            <div className="px-2">
              {loadingCategories ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Memuat kategori...</span>
                </div>
              ) : (
                <Select value={targetExam} onValueChange={setTargetExam}>
                  <SelectTrigger className="h-12 rounded-xl text-base">
                    <SelectValue placeholder="Pilih kategori ujian" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Opsional — kamu bisa melewati langkah ini
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between pt-8">
              <Button
                variant="ghost"
                onClick={prevStep}
                className="h-12 text-base"
              >
                <ChevronLeft className="mr-1 h-5 w-5" />
                Kembali
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={nextStep}
                  className="h-12 text-base"
                >
                  Lewati
                </Button>
                <Button
                  onClick={nextStep}
                  className="h-12 rounded-xl px-6 text-base"
                >
                  Lanjut
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Theme Picker */}
        {step === 2 && (
          <div className="flex flex-1 flex-col">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Pilih Tema Tampilan
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Personalisasi tampilan sesuai selera kamu. Bisa diubah kapan
                saja di pengaturan.
              </p>
            </div>

            <div>
              <ThemePicker
                previewOnly
                onSelect={(theme) => setSelectedTheme(theme)}
              />
            </div>

            <div className="mt-auto flex items-center justify-between pt-8">
              <Button
                variant="ghost"
                onClick={prevStep}
                className="h-12 text-base"
              >
                <ChevronLeft className="mr-1 h-5 w-5" />
                Kembali
              </Button>
              <Button
                onClick={completeOnboarding}
                disabled={saving}
                className="h-12 rounded-xl px-6 text-base"
              >
                {saving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Mulai Belajar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
