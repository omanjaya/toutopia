import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FileText, CheckCircle2, Clock, Wallet } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Pengajar",
};

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Soal
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disetujui
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{approvedQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Penghasilan
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(profile.totalEarnings)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
