import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { FileText, CheckCircle2, Clock, Wallet } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Pengajar",
};

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/dashboard/become-teacher");

  const [totalQuestions, approvedQuestions, pendingQuestions] =
    await Promise.all([
      prisma.question.count({ where: { createdById: session.user.id } }),
      prisma.question.count({
        where: { createdById: session.user.id, status: "APPROVED" },
      }),
      prisma.question.count({
        where: { createdById: session.user.id, status: "PENDING_REVIEW" },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Dashboard Pengajar
        </h2>
        <p className="text-muted-foreground">
          Selamat datang, {session.user.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Soal
            </p>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold">{totalQuestions}</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Disetujui
            </p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold">{approvedQuestions}</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Menunggu Review
            </p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold">{pendingQuestions}</p>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Penghasilan
            </p>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold">
              {formatCurrency(profile.totalEarnings)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
