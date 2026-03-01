import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import {
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
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Pengguna",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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
  if (roleFilter) where.role = roleFilter as Prisma.UserWhereInput["role"];
  if (statusFilter) where.status = statusFilter as Prisma.UserWhereInput["status"];

  const [users, total, activeCount, suspendedCount, adminCount, teacherCount, totalAll] =
    await Promise.all([
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
          credits: { select: { balance: true, freeCredits: true } },
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
      prisma.user.count(),
    ]);

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
    { title: "Pengajar", value: teacherCount, icon: GraduationCap, color: "bg-sky-500/10 text-sky-600" },
  ];

  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "name-asc", label: "Nama A–Z" },
    { value: "name-desc", label: "Nama Z–A" },
    { value: "last-login", label: "Login Terakhir" },
  ];

  const hasFilter = !!(q || roleFilter || statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Pengguna</h2>
            <p className="text-sm text-muted-foreground">Kelola semua pengguna terdaftar</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" asChild>
            <Link href={buildExportUrl()}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/users/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Tambah
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.title} className={cardCls}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {stat.value.toLocaleString("id-ID")}
                </p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form method="GET" action="/admin/users" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama atau email..."
                className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {sortFilter !== "newest" && <input type="hidden" name="sort" value={sortFilter} />}
            <Button type="submit" size="sm">Cari</Button>
          </form>

          <div className="h-5 w-px bg-border/60" />

          {/* Role filter */}
          <div className="flex gap-1 rounded-lg border p-1">
            {[
              { value: "", label: "Semua" },
              { value: "STUDENT", label: "Student" },
              { value: "TEACHER", label: "Teacher" },
              { value: "ADMIN", label: "Admin" },
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

          {/* Status filter */}
          <div className="flex gap-1 rounded-lg border p-1">
            {[
              { value: "", label: "Semua" },
              { value: "ACTIVE", label: "Aktif" },
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

          {/* Sort */}
          <div className="flex gap-1 rounded-lg border p-1">
            {sortOptions.map((s) => (
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

          {hasFilter && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" asChild>
              <Link href="/admin/users">Reset Filter</Link>
            </Button>
          )}
        </div>

        {hasFilter && (
          <p className="mt-3 text-xs text-muted-foreground border-t border-border/40 pt-3">
            Menampilkan <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> hasil
            {q && <> untuk &ldquo;{q}&rdquo;</>}
          </p>
        )}
      </div>

      {/* Table */}
      <UsersTable users={users} hasFilter={hasFilter} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> pengguna
          </p>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
              </Button>
            )}
            <span className="min-w-[60px] text-center text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
