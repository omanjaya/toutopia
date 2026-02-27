import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { MobileSettingsContent } from "./mobile-settings-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan",
  description: "Kelola pengaturan akun dan preferensi tampilan",
};

export default async function MobileSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/m/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  return <MobileSettingsContent hasPassword={!!user?.passwordHash} />;
}
