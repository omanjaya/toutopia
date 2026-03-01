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
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Pendaftaran Pengajar
          </h2>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-4 p-6">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-semibold">Pengajuan Sedang Diproses</p>
              <p className="text-sm text-muted-foreground">
                Tim kami sedang meninjau pengajuan Anda. Anda akan mendapat
                notifikasi saat disetujui.
              </p>
              <Badge variant="outline" className="mt-2">
                Menunggu Verifikasi
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Daftar Sebagai Pengajar
        </h2>
        <p className="text-muted-foreground">
          Kontribusi soal dan dapatkan penghasilan Rp 500 per soal per attempt
        </p>
      </div>

      <TeacherApplicationForm />
    </div>
  );
}
