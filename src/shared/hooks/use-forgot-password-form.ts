"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseForgotPasswordFormReturn {
  email: string;
  setEmail: (value: string) => void;
  loading: boolean;
  sent: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useForgotPasswordForm(): UseForgotPasswordFormReturn {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        toast.error(data.error?.message ?? "Gagal mengirim email");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return { email, setEmail, loading, sent, handleSubmit };
}
