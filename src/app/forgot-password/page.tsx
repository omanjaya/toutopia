"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenCheck, ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-semibold">Cek Email Kamu</h1>
              <p className="text-sm text-muted-foreground">
                Jika email <strong>{email}</strong> terdaftar, kami sudah mengirim link untuk reset password. Cek inbox dan folder spam.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Lupa Password?</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Masukkan email kamu dan kami akan mengirim link untuk reset password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Link Reset
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                  <ArrowLeft className="mr-1 inline h-3 w-3" />
                  Kembali ke Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
