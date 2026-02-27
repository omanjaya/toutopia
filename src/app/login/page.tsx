import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpenCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Toutopia kamu",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Subtle background gradient — Apple Aurora style */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2 transition-opacity hover:opacity-70">
        <BookOpenCheck className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold tracking-tight">Toutopia</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Selamat datang kembali</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Masuk untuk melanjutkan belajar
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
