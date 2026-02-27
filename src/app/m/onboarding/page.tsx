import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import type { SessionUser } from "@/shared/types/user.types";
import { MobileOnboardingWizard } from "./mobile-onboarding-wizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Selamat Datang",
  description:
    "Kenali fitur-fitur Toutopia dan personalisasi pengalaman belajar kamu",
};

export default async function MobileOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const user = session.user as SessionUser;
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingCompleted: true },
  });

  if (profile?.onboardingCompleted) redirect("/m/dashboard");

  return <MobileOnboardingWizard />;
}
