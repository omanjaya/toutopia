import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { DashboardLayout } from "@/shared/components/layout/dashboard-layout";
import { ThemeSync } from "@/shared/components/providers/theme-sync";
import { studentNav } from "@/config/navigation.config";
import type { SessionUser } from "@/shared/types/user.types";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as SessionUser;

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { theme: true },
  });

  return (
    <DashboardLayout user={user} navItems={studentNav}>
      {profile && <ThemeSync serverTheme={profile.theme} />}
      {children}
    </DashboardLayout>
  );
}
