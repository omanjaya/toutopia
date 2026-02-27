import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileResetPasswordForm } from "./mobile-reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset password akun Toutopia",
};

export default function MobileResetPasswordPage() {
  return (
    <Suspense>
      <MobileResetPasswordForm />
    </Suspense>
  );
}
