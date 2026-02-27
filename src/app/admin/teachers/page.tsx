import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { GraduationCap, Clock, UserCheck, Wallet } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { TeacherActions } from "./teacher-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Pengajar — Admin",
};

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const pendingCount = teachers.filter((t) => !t.isVerified).length;
  const verifiedCount = teachers.filter((t) => t.isVerified).length;
  const totalEarnings = teachers.reduce((s, t) => s + t.totalEarnings, 0);

  const statCards = [
    { title: "Menunggu Verifikasi", value: pendingCount.toString(), icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Terverifikasi", value: verifiedCount.toString(), icon: UserCheck, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Total Pengajar", value: teachers.length.toString(), icon: GraduationCap, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Penghasilan", value: formatCurrency(totalEarnings), icon: Wallet, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kelola Pengajar</h2>
        <p className="text-muted-foreground">
          Verifikasi dan kelola akun pengajar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Pendidikan</TableHead>
              <TableHead>Spesialisasi</TableHead>
              <TableHead>Penghasilan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{t.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.user.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{t.education}</TableCell>
                <TableCell className="text-sm">
                  {t.specialization.slice(0, 3).join(", ")}
                  {t.specialization.length > 3 && "..."}
                </TableCell>
                <TableCell className="text-sm font-medium tabular-nums">
                  {formatCurrency(t.totalEarnings)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      t.isVerified
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                        : "bg-amber-500/10 text-amber-700 border-amber-200"
                    }
                  >
                    {t.isVerified ? "Terverifikasi" : "Menunggu"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TeacherActions
                    teacherId={t.id}
                    isVerified={t.isVerified}
                  />
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Belum ada pendaftaran pengajar
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
