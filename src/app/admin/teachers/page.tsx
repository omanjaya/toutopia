import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
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
import { SortSelect } from "./sort-select";
import { TeachersTable } from "./teachers-table";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Pengajar — Admin",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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
    sort === "earnings" ? [{ totalEarnings: "desc" }]
    : sort === "name" ? [{ user: { name: "asc" } }]
    : [{ isVerified: "asc" }, { createdAt: "desc" }];

  const [teachers, total, pendingCount, verifiedCount, totalEarnings] = await Promise.all([
    prisma.teacherProfile.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { user: { select: { id: true, name: true, email: true } } },
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
      value: pendingCount,
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600",
      urgent: pendingCount > 0,
    },
    {
      title: "Terverifikasi",
      value: verifiedCount,
      icon: UserCheck,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Total Pengajar",
      value: total,
      icon: GraduationCap,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Penghasilan",
      value: formatCurrency(totalEarnings._sum.totalEarnings ?? 0),
      icon: Wallet,
      color: "bg-violet-500/10 text-violet-600",
      isFormatted: true,
    },
  ];

  const filterTabs = [
    { value: "", label: "Semua" },
    { value: "pending", label: "Menunggu" },
    { value: "verified", label: "Terverifikasi" },
  ];

  const hasFilter = !!(q || status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Kelola Pengajar</h2>
          <p className="text-sm text-muted-foreground">Verifikasi dan kelola akun pengajar</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`${cardCls} ${stat.urgent ? "ring-amber-300/60" : ""}`}
          >
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {stat.isFormatted
                    ? stat.value
                    : typeof stat.value === "number"
                    ? stat.value.toLocaleString("id-ID")
                    : stat.value}
                </p>
                {stat.urgent && (
                  <p className="mt-0.5 text-[11px] font-medium text-amber-600">Perlu ditinjau</p>
                )}
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <form method="GET" action="/admin/teachers" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama atau email..."
                className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {status && <input type="hidden" name="status" value={status} />}
            {sort && sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
            <Button type="submit" size="sm">Cari</Button>
          </form>

          <div className="h-5 w-px bg-border/60" />

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

          <SortSelect currentSort={sort} currentStatus={status} currentQ={q} />

          {hasFilter && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" asChild>
              <Link href="/admin/teachers">Reset</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Table with bulk actions */}
      <TeachersTable teachers={teachers} hasFilter={hasFilter} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> pengajar
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
