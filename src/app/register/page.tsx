import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun Toutopia gratis dan mulai berlatih",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Buat Akun Toutopia
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar gratis dan dapatkan 2 try out pertama tanpa biaya
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
