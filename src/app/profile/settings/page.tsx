import type { Metadata } from "next";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileSection } from "./profile-section";
import { ThemeSection } from "./theme-section";
import { NotificationSection } from "./notification-section";
import { DeleteAccountSection } from "./delete-account-section";

export const metadata: Metadata = {
  title: "Pengaturan",
  description: "Kelola pengaturan akun dan preferensi tampilan",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola preferensi akun dan tampilan kamu
        </p>
      </div>

      <ProfileSection />
      <ThemeSection />
      <NotificationSection />
      <DeleteAccountSection hasPassword={!!user?.passwordHash} />
    </div>
  );
}
