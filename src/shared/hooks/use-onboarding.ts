"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ONBOARDING_STEPS,
  type OnboardingExamCategory,
  type OnboardingTheme,
} from "@/shared/lib/onboarding.constants";

interface UseOnboardingOptions {
  /** Path to redirect to after completing onboarding */
  redirectPath: string;
}

interface UseOnboardingReturn {
  step: number;
  saving: boolean;
  targetExam: string;
  selectedTheme: OnboardingTheme;
  categories: OnboardingExamCategory[];
  loadingCategories: boolean;
  totalSteps: number;
  setTargetExam: (value: string) => void;
  setSelectedTheme: (theme: OnboardingTheme) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => Promise<void>;
  skipToEnd: () => Promise<void>;
}

export function useOnboarding({ redirectPath }: UseOnboardingOptions): UseOnboardingReturn {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [targetExam, setTargetExam] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<OnboardingTheme>("DEFAULT");
  const [categories, setCategories] = useState<OnboardingExamCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (step === 1 && categories.length === 0) {
      setLoadingCategories(true);
      fetch("/api/categories")
        .then((res) => res.json())
        .then((result: { data?: OnboardingExamCategory[] }) => {
          if (result.data) setCategories(result.data);
        })
        .catch(() => {})
        .finally(() => setLoadingCategories(false));
    }
  }, [step, categories.length]);

  function nextStep(): void {
    if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
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
      router.push(redirectPath);
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
        router.push(redirectPath);
      }
    } finally {
      setSaving(false);
    }
  }

  return {
    step,
    saving,
    targetExam,
    selectedTheme,
    categories,
    loadingCategories,
    totalSteps: ONBOARDING_STEPS.length,
    setTargetExam,
    setSelectedTheme,
    nextStep,
    prevStep,
    completeOnboarding,
    skipToEnd,
  };
}
