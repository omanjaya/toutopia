import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { DashboardLayout } from "@/shared/components/layout/dashboard-layout";
import { adminNav } from "@/config/navigation.config";
import type { SessionUser } from "@/shared/types/user.types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      user={session.user as SessionUser}
      navItems={adminNav}
    >
      {children}
    </DashboardLayout>
  );
}
