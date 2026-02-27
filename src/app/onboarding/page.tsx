import type { Metadata } from "next";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = {
  title: "Selamat Datang",
  description: "Kenali fitur-fitur Toutopia dan personalisasi pengalaman belajar kamu",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
