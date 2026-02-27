"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpenCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
        setTimeout(() => router.push("/login"), 3000);
      } else {
        toast.error(data.error?.message ?? "Gagal reset password");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Link reset tidak valid.</p>
          <Button asChild>
            <Link href="/forgot-password">Minta Link Baru</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Link href="/" className="mb-10 flex items-center gap-2 transition-opacity hover:opacity-70">
        <BookOpenCheck className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold tracking-tight">Toutopia</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-xl font-semibold">Password Berhasil Direset</h1>
              <p className="text-sm text-muted-foreground">
                Kamu akan dialihkan ke halaman login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Masukkan password baru untuk akun kamu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimal 8 karakter, mengandung huruf besar dan angka
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Konfirmasi Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Ketik ulang password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
