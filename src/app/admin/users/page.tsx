import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getInitials } from "@/shared/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Pengguna",
};

const roleBadgeClass: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-500/20",
  ADMIN: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-500/20",
  TEACHER: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-500/20",
  STUDENT: "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400 dark:border-slate-500/20",
};

const statusBadgeClass: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-500/20",
  SUSPENDED: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-500/20",
  BANNED: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-500/20",
  DELETED: "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400 dark:border-slate-500/20",
};

const ITEMS_PER_PAGE = 20;

interface Props {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const roleFilter = params.role ?? "";
  const statusFilter = params.status ?? "";
  const sortFilter = params.sort ?? "newest";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const orderByMap: Record<string, Prisma.UserOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    "name-asc": { name: "asc" },
    "name-desc": { name: "desc" },
    "last-login": { lastLoginAt: "desc" },
  };
  const orderBy = orderByMap[sortFilter] ?? orderByMap.newest;

  const where: Prisma.UserWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (roleFilter) {
    where.role = roleFilter as Prisma.UserWhereInput["role"];
  }

  if (statusFilter) {
    where.status = statusFilter as Prisma.UserWhereInput["status"];
  }

  const [users, total, activeCount, suspendedCount, adminCount, teacherCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        credits: {
          select: { balance: true, freeCredits: true },
        },
        packageAccesses: {
          where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          select: { package: { select: { title: true, isFree: true } } },
          orderBy: { grantedAt: "desc" },
        },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
  ]);

  const totalAll = await prisma.user.count();
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (overrides.q ?? q) p.set("q", overrides.q ?? q);
    if (overrides.role ?? roleFilter) p.set("role", overrides.role ?? roleFilter);
    if (overrides.status ?? statusFilter) p.set("status", overrides.status ?? statusFilter);
    const sortVal = overrides.sort ?? sortFilter;
    if (sortVal && sortVal !== "newest") p.set("sort", sortVal);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/users?${p.toString()}`;
  }

  function buildExportUrl(): string {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (roleFilter) p.set("role", roleFilter);
    if (statusFilter) p.set("status", statusFilter);
    return `/api/admin/users/export?${p.toString()}`;
  }

  const statCards = [
    { title: "Total Pengguna", value: totalAll, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { title: "Aktif", value: activeCount, icon: UserCheck, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Suspended", value: suspendedCount, icon: UserX, color: "bg-amber-500/10 text-amber-600" },
    { title: "Admin", value: adminCount, icon: Shield, color: "bg-violet-500/10 text-violet-600" },
    { title: "Teacher", value: teacherCount, icon: GraduationCap, color: "bg-sky-500/10 text-sky-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pengguna</h2>
          <p className="text-muted-foreground">
            Kelola semua pengguna terdaftar di platform
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <div className="text-2xl font-bold">{stat.value.toLocaleString("id-ID")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form method="GET" action="/admin/users" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau email..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <Button type="submit" size="sm">Cari</Button>
        </form>

        <div className="flex gap-1 rounded-lg border p-1">
          {[
            { value: "", label: "Semua Role" },
            { value: "STUDENT", label: "Student" },
            { value: "TEACHER", label: "Teacher" },
            { value: "ADMIN", label: "Admin" },
            { value: "SUPER_ADMIN", label: "Super Admin" },
          ].map((r) => (
            <Link
              key={r.value}
              href={buildUrl({ role: r.value, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                roleFilter === r.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-1 rounded-lg border p-1">
          {[
            { value: "", label: "Semua Status" },
            { value: "ACTIVE", label: "Active" },
            { value: "SUSPENDED", label: "Suspended" },
            { value: "BANNED", label: "Banned" },
          ].map((s) => (
            <Link
              key={s.value}
              href={buildUrl({ status: s.value, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-1 rounded-lg border p-1">
          <ArrowUpDown className="my-auto ml-2 h-3.5 w-3.5 text-muted-foreground" />
          {[
            { value: "newest", label: "Terbaru" },
            { value: "oldest", label: "Terlama" },
            { value: "name-asc", label: "Nama A-Z" },
            { value: "name-desc", label: "Nama Z-A" },
            { value: "last-login", label: "Login Terakhir" },
          ].map((s) => (
            <Link
              key={s.value}
              href={buildUrl({ sort: s.value, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                sortFilter === s.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={buildExportUrl()}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Link>
        </Button>
      </div>

      {/* Result count */}
      {(q || roleFilter || statusFilter) && (
        <p className="text-sm text-muted-foreground">
          Menampilkan {total} hasil
          {q && <> untuk &quot;{q}&quot;</>}
        </p>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kredit</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead>Login Terakhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium hover:underline">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleBadgeClass[user.role] ?? ""}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClass[user.status] ?? ""}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(() => {
                    const balance = user.credits?.balance ?? 0;
                    return (
                      <span className={`text-sm font-medium ${balance > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {balance.toLocaleString("id-ID")}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  {user.packageAccesses.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.packageAccesses.map((access) => (
                        <Badge
                          key={access.package.title}
                          variant={access.package.isFree ? "outline" : "secondary"}
                          className="text-xs"
                        >
                          {access.package.title}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(user.createdAt, "dd MMM yyyy", { locale: localeId })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastLoginAt
                    ? format(user.lastLoginAt, "dd MMM yyyy HH:mm", {
                        locale: localeId,
                      })
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {q || roleFilter || statusFilter
                        ? "Tidak ada pengguna yang sesuai filter"
                        : "Belum ada pengguna terdaftar"}
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
            Halaman {page} dari {totalPages} ({total} pengguna)
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
