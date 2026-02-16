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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kelola Pengajar</h2>
        <p className="text-muted-foreground">
          {pendingCount > 0
            ? `${pendingCount} pengajuan menunggu verifikasi`
            : `${verifiedCount} pengajar terdaftar`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Terverifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{verifiedCount}</p>
          </CardContent>
        </Card>
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
                <TableCell className="text-sm">
                  {formatCurrency(t.totalEarnings)}
                </TableCell>
                <TableCell>
                  <Badge variant={t.isVerified ? "default" : "outline"}>
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
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Belum ada pendaftaran pengajar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
