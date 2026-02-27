import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { DashboardLayout } from "@/shared/components/layout/dashboard-layout";
import { ThemeSync } from "@/shared/components/providers/theme-sync";
import { studentNav, parentNav } from "@/config/navigation.config";
import type { SessionUser } from "@/shared/types/user.types";

const getProfile = cache((userId: string) =>
  prisma.userProfile.findUnique({
    where: { userId },
    select: { onboardingCompleted: true, theme: true },
  })
);

const getActivePlan = cache(async (userId: string) => {
  const access = await prisma.userPackageAccess.findFirst({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { grantedAt: "desc" },
    select: { package: { select: { title: true, isFree: true } } },
  });
  return access?.package ?? null;
});

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as SessionUser;

  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  }

  const [profile, activePlan] = await Promise.all([
    getProfile(user.id),
    getActivePlan(user.id),
  ]);

  if (!profile || !profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  const planLabel = activePlan ? activePlan.title : null;

  const navItems = user.role === "PARENT" ? parentNav : studentNav;

  return (
    <DashboardLayout user={user} navItems={navItems} planLabel={planLabel}>
      <ThemeSync serverTheme={profile.theme} />
      {children}
    </DashboardLayout>
  );
}
