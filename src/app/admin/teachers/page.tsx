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
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  UserCheck,
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { TeacherActions } from "./teacher-actions";
import { SortSelect } from "./sort-select";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Pengajar — Admin",
};

const ITEMS_PER_PAGE = 20;

interface Props {
  searchParams: Promise<{
    status?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminTeachersPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status ?? "";
  const q = params.q ?? "";
  const sort = params.sort ?? "newest";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Prisma.TeacherProfileWhereInput = {};
  if (status === "pending") where.isVerified = false;
  if (status === "verified") where.isVerified = true;
  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const orderBy: Prisma.TeacherProfileOrderByWithRelationInput[] =
    sort === "earnings"
      ? [{ totalEarnings: "desc" }]
      : sort === "name"
      ? [{ user: { name: "asc" } }]
      : [{ isVerified: "asc" }, { createdAt: "desc" }];

  const [teachers, total, pendingCount, verifiedCount, totalEarnings] =
    await Promise.all([
      prisma.teacherProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.teacherProfile.count({ where }),
      prisma.teacherProfile.count({ where: { isVerified: false } }),
      prisma.teacherProfile.count({ where: { isVerified: true } }),
      prisma.teacherProfile.aggregate({ _sum: { totalEarnings: true } }),
    ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (overrides.q ?? q) p.set("q", overrides.q ?? q);
    if (overrides.status ?? status) p.set("status", overrides.status ?? status);
    if (overrides.sort ?? sort) p.set("sort", overrides.sort ?? sort);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/teachers?${p.toString()}`;
  }

  const statCards = [
    {
      title: "Menunggu Verifikasi",
      value: pendingCount.toString(),
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Terverifikasi",
      value: verifiedCount.toString(),
      icon: UserCheck,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Total Pengajar",
      value: total.toString(),
      icon: GraduationCap,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Penghasilan",
      value: formatCurrency(totalEarnings._sum.totalEarnings ?? 0),
      icon: Wallet,
      color: "bg-violet-500/10 text-violet-600",
    },
  ];

  const filterTabs = [
    { value: "", label: "Semua" },
    { value: "pending", label: "Menunggu Verifikasi" },
    { value: "verified", label: "Terverifikasi" },
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
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form
          method="GET"
          action="/admin/teachers"
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau email..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          {status && <input type="hidden" name="status" value={status} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <Button type="submit" size="sm">
            Cari
          </Button>
        </form>

        {/* Status filter tabs */}
        <div className="flex gap-1 rounded-lg border p-1">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Sort select */}
        <SortSelect currentSort={sort} currentStatus={status} currentQ={q} />
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
                  <TeacherActions teacherId={t.id} isVerified={t.isVerified} />
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {q || status
                        ? "Tidak ada pengajar yang sesuai filter"
                        : "Belum ada pendaftaran pengajar"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} pengajar)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Sebelumnya
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
