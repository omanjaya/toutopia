import type { Metadata } from "next";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { AiSettings } from "./ai-settings";
import { AnnouncementSettings } from "./announcements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan — Admin",
};

export default async function AdminSettingsPage() {
  const session = await auth();
  const role = (session?.user as { role: string })?.role;

  if (role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground">
          Konfigurasi platform dan fitur
        </p>
      </div>

      <AnnouncementSettings />
      <AiSettings />
    </div>
  );
}
