"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/shared/lib/validators";

function getSafeCallbackUrl(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (raw.startsWith("/") && !raw.includes("://") && !raw.includes("//")) {
    return raw;
  }
  return "/dashboard";
}

interface UseLoginFormReturn {
  form: UseFormReturn<LoginInput>;
  isGoogleLoading: boolean;
  onSubmit: (data: LoginInput) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
}

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput): Promise<void> {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.code === "EMAIL_NOT_VERIFIED") {
          toast.error("Email belum diverifikasi. Silakan hubungi admin.");
        } else {
          toast.error("Email atau password salah");
        }
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    }
  }

  async function handleGoogleLogin(): Promise<void> {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Gagal login dengan Google. Silakan coba lagi.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return { form, isGoogleLoading, onSubmit, handleGoogleLogin };
}
