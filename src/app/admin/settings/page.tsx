import type { Metadata } from "next";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Pengaturan</h2>
          <p className="text-sm text-muted-foreground">Konfigurasi platform dan fitur</p>
        </div>
      </div>

      <AnnouncementSettings />
      <AiSettings />
    </div>
  );
}
