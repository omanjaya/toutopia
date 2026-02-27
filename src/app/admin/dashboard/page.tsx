import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Users,
  BookOpen,
  CreditCard,
  FileText,
  BarChart3,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Package,
  FilePlus,
  UserPlus,
  Tag,
  AlertCircle,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { AdminChartsWrapper } from "./admin-charts-wrapper";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

async function getStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    userCount,
    newUsersThisMonth,
    packageCount,
    questionCount,
    pendingQuestions,
    transactionResult,
    attemptCount,
    teacherCount,
    pendingTeachers,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.examPackage.count({ where: { status: "PUBLISHED" } }),
    prisma.question.count({ where: { status: "APPROVED" } }),
    prisma.question.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.transaction.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.examAttempt.count({ where: { status: "COMPLETED" } }),
    prisma.teacherProfile.count({ where: { isVerified: true } }),
    prisma.teacherProfile.count({ where: { isVerified: false } }),
    prisma.transaction.aggregate({
      where: { status: "PAID", paidAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    userCount,
    newUsersThisMonth,
    packageCount,
    questionCount,
    pendingQuestions,
    totalRevenue: transactionResult._sum.amount ?? 0,
    transactionCount: transactionResult._count,
    revenueThisMonth: recentTransactions._sum.amount ?? 0,
    transactionsThisMonth: recentTransactions._count,
    attemptCount,
    teacherCount,
    pendingTeachers,
  };
}

const iconColors: Record<string, string> = {
  users: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  revenue: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  packages: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  questions: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  exams: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  teachers: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats.userCount.toLocaleString("id-ID"),
      subtitle: `+${stats.newUsersThisMonth} bulan ini`,
      icon: Users,
      color: iconColors.users,
      href: "/admin/users",
    },
    {
      title: "Total Pendapatan",
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${formatCurrency(stats.revenueThisMonth)} bulan ini`,
      icon: CreditCard,
      color: iconColors.revenue,
      href: "/admin/transactions",
    },
    {
      title: "Paket Published",
      value: stats.packageCount.toString(),
      subtitle: `${stats.transactionCount.toLocaleString("id-ID")} transaksi total`,
      icon: BookOpen,
      color: iconColors.packages,
      href: "/admin/packages",
    },
    {
      title: "Bank Soal",
      value: stats.questionCount.toLocaleString("id-ID"),
      subtitle: stats.pendingQuestions > 0
        ? `${stats.pendingQuestions} menunggu review`
        : "Semua soal ter-review",
      icon: FileText,
      color: iconColors.questions,
      href: "/admin/questions",
    },
    {
      title: "Ujian Selesai",
      value: stats.attemptCount.toLocaleString("id-ID"),
      subtitle: "Total attempt selesai",
      icon: BarChart3,
      color: iconColors.exams,
      href: "/admin/packages",
    },
    {
      title: "Pengajar Aktif",
      value: stats.teacherCount.toString(),
      subtitle: stats.pendingTeachers > 0
        ? `${stats.pendingTeachers} menunggu verifikasi`
        : "Semua terverifikasi",
      icon: GraduationCap,
      color: iconColors.teachers,
      href: "/admin/teachers",
    },
  ];

  const quickActions = [
    { title: "Buat Paket", href: "/admin/packages/new", icon: Package },
    { title: "Tambah Soal", href: "/admin/questions/new", icon: FilePlus },
    { title: "Kelola Users", href: "/admin/users", icon: UserPlus },
    { title: "Buat Promo", href: "/admin/promos/new", icon: Tag },
  ];

  const hasAlerts = stats.pendingQuestions > 0 || stats.pendingTeachers > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Ringkasan platform Toutopia
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <Button key={action.href} variant="outline" size="sm" asChild>
              <Link href={action.href}>
                <action.icon className="mr-1.5 h-3.5 w-3.5" />
                {action.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {hasAlerts && (
        <div className="flex flex-wrap gap-3">
          {stats.pendingQuestions > 0 && (
            <Link
              href="/admin/questions?status=PENDING"
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/15"
            >
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-800 dark:text-amber-300">
                <span className="font-semibold">{stats.pendingQuestions}</span> soal menunggu review
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </Link>
          )}
          {stats.pendingTeachers > 0 && (
            <Link
              href="/admin/teachers"
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm transition-colors hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:hover:bg-blue-500/15"
            >
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-300">
                <span className="font-semibold">{stats.pendingTeachers}</span> pengajar menunggu verifikasi
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </Link>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <AdminChartsWrapper />
    </div>
  );
}
