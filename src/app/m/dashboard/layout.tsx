import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { MobileLayout } from "@/app/m/mobile-layout";

export default async function MobileDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <MobileLayout>{children}</MobileLayout>;
}
