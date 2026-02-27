import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileRegisterForm } from "./mobile-register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun Toutopia gratis dan mulai berlatih",
};

export default function MobileRegisterPage() {
  return (
    <Suspense>
      <MobileRegisterForm />
    </Suspense>
  );
}
