"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpenCheck, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { loginSchema, type LoginInput } from "@/shared/lib/validators";

function getSafeCallbackUrl(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (raw.startsWith("/") && !raw.includes("://") && !raw.includes("//")) {
    return raw;
  }
  return "/dashboard";
}

export function MobileLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
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
        toast.error("Email atau password salah");
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

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-16">
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center">
        <Link href="/m" className="flex items-center gap-2.5">
          <BookOpenCheck className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold tracking-tight">Toutopia</span>
        </Link>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Selamat datang kembali
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Masuk untuk melanjutkan belajar
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            className="h-12 rounded-xl text-base"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="rounded-md px-1 py-1 text-xs font-medium text-primary hover:underline underline-offset-4"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              autoComplete="current-password"
              className="h-12 rounded-xl pr-12 text-base"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-muted-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          Masuk
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">atau</span>
        </div>
      </div>

      {/* Google */}
      <Button
        variant="outline"
        className="h-12 w-full rounded-xl text-base"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isSubmitting}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Masuk dengan Google
      </Button>

      {/* Bottom link */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/m/register"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
