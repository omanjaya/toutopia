import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { TeacherApplicationForm } from "./teacher-application-form";
import { Badge } from "@/shared/components/ui/badge";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Pengajar",
};

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export default async function BecomeTeacherPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // If already a teacher, redirect
  if (session.user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  }

  // Check if already applied
  const existingProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existingProfile && !existingProfile.isVerified) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 pb-20 md:px-0 md:pb-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            Pendaftaran Pengajar
          </h2>
        </div>
        <div className={cardCls}>
          <div className="flex items-start gap-4 p-4 md:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Pengajuan Sedang Diproses</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tim kami sedang meninjau pengajuan Anda. Anda akan mendapat
                notifikasi saat disetujui.
              </p>
              <Badge variant="outline" className="mt-3">
                Menunggu Verifikasi
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pb-20 md:px-0 md:pb-0 md:space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Daftar Sebagai Pengajar
        </h2>
        <p className="text-sm text-muted-foreground">
          Kontribusi soal dan dapatkan penghasilan Rp 500 per soal per attempt
        </p>
      </div>

      {/* Mobile info banner */}
      <div className="rounded-2xl bg-primary/5 p-4 md:hidden">
        <p className="text-sm font-medium">Keuntungan Menjadi Pengajar</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>Rp 500 per soal per attempt siswa</li>
          <li>Kontribusi ke pendidikan Indonesia</li>
          <li>Dashboard pengajar khusus</li>
        </ul>
      </div>

      <TeacherApplicationForm />
    </div>
  );
}
