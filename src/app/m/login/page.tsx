import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileLoginForm } from "./mobile-login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Toutopia kamu",
};

export default function MobileLoginPage() {
  return (
    <Suspense>
      <MobileLoginForm />
    </Suspense>
  );
}
