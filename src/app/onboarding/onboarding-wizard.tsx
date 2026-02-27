"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  BarChart3,
  CalendarDays,
  Palette,
  Target,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
    description: "Bandingkan skor dengan peserta lain dan raih peringkat terbaik",
  },
];

export function OnboardingWizard() {
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

  function nextStep() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

  async function completeOnboarding() {
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
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  async function skipToEnd() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: "DEFAULT" }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-2 rounded-full transition-all",
              i === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Step 1: Welcome / Feature Tour */}
      {step === 0 && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Selamat datang di Toutopia!</CardTitle>
            <p className="text-muted-foreground mt-1">
              Platform persiapan ujian terlengkap. Kenali fitur-fitur utama kami:
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" size="sm" onClick={skipToEnd} disabled={saving}>
                Lewati
              </Button>
              <Button onClick={nextStep}>
                Lanjut
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Target Exam */}
      {step === 1 && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Target Ujian Kamu</CardTitle>
            <p className="text-muted-foreground mt-1">
              Pilih ujian yang sedang kamu persiapkan (bisa diubah nanti)
            </p>
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-sm mt-4">
              {loadingCategories ? (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat kategori...
                </div>
              ) : (
                <Select value={targetExam} onValueChange={setTargetExam}>
                  <SelectTrigger>
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
              <p className="text-xs text-muted-foreground text-center mt-2">
                Opsional — kamu bisa melewati langkah ini
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" size="sm" onClick={prevStep}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Kembali
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={nextStep}>
                  Lewati
                </Button>
                <Button onClick={nextStep}>
                  Lanjut
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Theme Picker */}
      {step === 2 && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Palette className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Pilih Tema Tampilan</CardTitle>
            <p className="text-muted-foreground mt-1">
              Personalisasi tampilan sesuai selera kamu. Bisa diubah kapan saja di pengaturan.
            </p>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <ThemePicker
                previewOnly
                onSelect={(theme) => setSelectedTheme(theme)}
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" size="sm" onClick={prevStep}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Kembali
              </Button>
              <Button onClick={completeOnboarding} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mulai Belajar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
