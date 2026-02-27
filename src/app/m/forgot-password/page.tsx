"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenCheck, ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

export default function MobileForgotPasswordPage() {
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

      {sent ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Cek Email Kamu</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Jika email <strong>{email}</strong> terdaftar, kami sudah mengirim
            link untuk reset password. Cek inbox dan folder spam.
          </p>
          <Button
            variant="outline"
            className="mt-8 h-12 w-full rounded-xl text-base"
            asChild
          >
            <Link href="/m/login">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Kembali ke Login
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Lupa Password?
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Masukkan email kamu dan kami akan mengirim link untuk reset
              password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="m-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="m-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 rounded-xl text-base"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Kirim Link Reset
            </Button>
          </form>

          {/* Back to login */}
          <div className="mt-auto pt-10 text-center">
            <Link
              href="/m/login"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4 min-h-[44px] py-2"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
