"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseResetPasswordFormOptions {
  successRedirectPath: string;
}

interface UseResetPasswordFormReturn {
  token: string | null;
  password: string;
  setPassword: (value: string) => void;
  confirm: string;
  setConfirm: (value: string) => void;
  loading: boolean;
  success: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useResetPasswordForm(
  options: UseResetPasswordFormOptions
): UseResetPasswordFormReturn {
  const { successRedirectPath } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Password tidak cocok");
      return;
    }

    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push(successRedirectPath), 3000);
      } else {
        toast.error(data.error?.message ?? "Gagal reset password");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return { token, password, setPassword, confirm, setConfirm, loading, success, handleSubmit };
}
