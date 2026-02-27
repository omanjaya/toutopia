"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

export function MobileResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        setTimeout(() => router.push("/m/login"), 3000);
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <p className="text-center text-muted-foreground">
          Link reset tidak valid.
        </p>
        <Button className="mt-4 h-12 w-full rounded-xl text-base" asChild>
          <Link href="/m/forgot-password">Minta Link Baru</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-16">
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center">
        <Link href="/m" className="flex items-center gap-2.5">
          <BookOpenCheck className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold tracking-tight">
            Toutopia
          </span>
        </Link>
      </div>

      {success ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold">Password Berhasil Direset</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kamu akan dialihkan ke halaman login...
          </p>
        </div>
      ) : (
        <>
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Reset Password
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Masukkan password baru untuk akun kamu.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="m-password" className="text-sm font-medium">
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="m-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-12 rounded-xl pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-muted-foreground"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimal 8 karakter, mengandung huruf besar dan angka
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="m-confirm" className="text-sm font-medium">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="m-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ketik ulang password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="h-12 rounded-xl pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-muted-foreground"
                  tabIndex={-1}
                  aria-label={
                    showConfirm
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
