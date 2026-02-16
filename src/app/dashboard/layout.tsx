import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { DashboardLayout } from "@/shared/components/layout/dashboard-layout";
import { studentNav } from "@/config/navigation.config";
import type { SessionUser } from "@/shared/types/user.types";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      user={session.user as SessionUser}
      navItems={studentNav}
    >
      {children}
    </DashboardLayout>
  );
}
