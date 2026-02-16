import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Users, BookOpen, CreditCard, FileText, BarChart3, GraduationCap } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { AdminCharts } from "./admin-charts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

async function getStats() {
  const [userCount, packageCount, questionCount, transactionResult, attemptCount, teacherCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.examPackage.count({ where: { status: "PUBLISHED" } }),
      prisma.question.count({ where: { status: "APPROVED" } }),
      prisma.transaction.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.examAttempt.count({ where: { status: "COMPLETED" } }),
      prisma.teacherProfile.count({ where: { isVerified: true } }),
    ]);

  return {
    userCount,
    packageCount,
    questionCount,
    totalRevenue: transactionResult._sum.amount ?? 0,
    transactionCount: transactionResult._count,
    attemptCount,
    teacherCount,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats.userCount.toLocaleString("id-ID"),
      icon: Users,
    },
    {
      title: "Total Pendapatan",
      value: formatCurrency(stats.totalRevenue),
      icon: CreditCard,
    },
    {
      title: "Paket Published",
      value: stats.packageCount.toString(),
      icon: BookOpen,
    },
    {
      title: "Bank Soal",
      value: stats.questionCount.toLocaleString("id-ID"),
      icon: FileText,
    },
    {
      title: "Ujian Selesai",
      value: stats.attemptCount.toLocaleString("id-ID"),
      icon: BarChart3,
    },
    {
      title: "Pengajar Aktif",
      value: stats.teacherCount.toString(),
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Ringkasan platform Toutopia
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminCharts />
    </div>
  );
}
