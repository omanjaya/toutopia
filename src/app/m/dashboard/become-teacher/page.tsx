import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { MobileTeacherApplicationForm } from "./teacher-application-form";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Pengajar",
};

export default async function MobileBecomeTeacherPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // If already a teacher, redirect
  if (session.user.role === "TEACHER") {
    redirect("/m/dashboard");
  }

  // Check if already applied
  const existingProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {existingProfile && !existingProfile.isVerified
              ? "Pendaftaran Pengajar"
              : "Daftar Sebagai Pengajar"}
          </h1>
          {!(existingProfile && !existingProfile.isVerified) && (
            <p className="text-xs text-muted-foreground">
              Kontribusi soal dan dapatkan penghasilan
            </p>
          )}
        </div>
      </div>

      {existingProfile && !existingProfile.isVerified ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-4 p-4">
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
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Info Banner */}
          <Card className="mb-4 border-0 bg-primary/5 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium">Keuntungan Menjadi Pengajar</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>Rp 500 per soal per attempt siswa</li>
                <li>Kontribusi ke pendidikan Indonesia</li>
                <li>Dashboard pengajar khusus</li>
              </ul>
            </CardContent>
          </Card>

          <MobileTeacherApplicationForm />
        </>
      )}
    </div>
  );
}
