"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/shared/lib/validators";

interface UseRegisterFormOptions {
  loginPath?: string;
}

interface UseRegisterFormReturn {
  form: UseFormReturn<RegisterInput>;
  referralCode: string;
  setReferralCode: (value: string) => void;
  isGoogleLoading: boolean;
  onSubmit: (data: RegisterInput) => Promise<void>;
  handleGoogleRegister: () => Promise<void>;
}

export function useRegisterForm(
  options: UseRegisterFormOptions = {}
): UseRegisterFormReturn {
  const { loginPath = "/login" } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(
    searchParams.get("ref") ?? ""
  );

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput): Promise<void> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          referralCode: referralCode || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal mendaftar");
        return;
      }

      toast.success("Akun berhasil dibuat! Cek email kamu untuk verifikasi.", {
        duration: 6000,
      });

      router.push(loginPath);
    } catch {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
    }
  }

  async function handleGoogleRegister(): Promise<void> {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Gagal daftar dengan Google. Silakan coba lagi.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return {
    form,
    referralCode,
    setReferralCode,
    isGoogleLoading,
    onSubmit,
    handleGoogleRegister,
  };
}
