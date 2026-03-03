import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Button } from "@/shared/components/ui/button";
import {
  Plus,
  Package,
  BookOpen,
  Archive,
  FileEdit,
  Layers,
  Search,
  Users,
  Wand2,
} from "lucide-react";
import { PackagesTable } from "./packages-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Paket Ujian",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

type SortOption = "newest" | "oldest" | "popular" | "price_high" | "price_low";

function getOrderBy(sort: SortOption) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "popular":
      return { attempts: { _count: "desc" as const } };
    case "price_high":
      return { price: "desc" as const };
    case "price_low":
      return { price: "asc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; search?: string; status?: string }>;
}) {
  const { sort: rawSort, search, status: statusFilter } = await searchParams;
  const sort: SortOption =
    rawSort === "oldest" ||
    rawSort === "popular" ||
    rawSort === "price_high" ||
    rawSort === "price_low"
      ? rawSort
      : "newest";

  const where: Prisma.ExamPackageWhereInput = {
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    ...(statusFilter ? { status: statusFilter as Prisma.EnumExamPackageStatusFilter } : {}),
  };

  const [packages, totalPublished, totalDraft, totalArchived] = await Promise.all([
    prisma.examPackage.findMany({
      where,
      orderBy: getOrderBy(sort),
      include: {
        category: { select: { name: true } },
        _count: { select: { attempts: true } },
      },
    }),
    prisma.examPackage.count({ where: { status: "PUBLISHED" } }),
    prisma.examPackage.count({ where: { status: "DRAFT" } }),
    prisma.examPackage.count({ where: { status: "ARCHIVED" } }),
  ]);

  const totalAttempts = packages.reduce((s, p) => s + p._count.attempts, 0);

  const statCards = [
    { title: "Published", value: totalPublished, icon: BookOpen, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Draft", value: totalDraft, icon: FileEdit, color: "bg-slate-500/10 text-slate-600" },
    { title: "Archived", value: totalArchived, icon: Archive, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Peserta", value: totalAttempts, icon: Users, color: "bg-blue-500/10 text-blue-600" },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "popular", label: "Terpopuler" },
    { value: "price_high", label: "Harga ↑" },
    { value: "price_low", label: "Harga ↓" },
  ];

  const statusTabs = [
    { value: "", label: "Semua" },
    { value: "PUBLISHED", label: "Published" },
    { value: "DRAFT", label: "Draft" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  function buildHref(params: { sort?: string; search?: string; status?: string }): string {
    const qs = new URLSearchParams();
    const s = params.sort ?? sort;
    const q = params.search !== undefined ? params.search : (search ?? "");
    const st = params.status !== undefined ? params.status : (statusFilter ?? "");
    if (s && s !== "newest") qs.set("sort", s);
    if (q) qs.set("search", q);
    if (st) qs.set("status", st);
    const str = qs.toString();
    return `/admin/packages${str ? `?${str}` : ""}`;
  }

  const hasFilter = !!(search || statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Paket Ujian</h2>
            <p className="text-sm text-muted-foreground">Kelola paket try out di platform</p>
          </div>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/packages/auto-generate">
              <Wand2 className="mr-1.5 h-3.5 w-3.5" />
              Auto Generate
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/packages/series/new">
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              Buat Seri
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/packages/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Buat Paket
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Filter bar */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search form */}
          <form method="GET" action="/admin/packages" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="search"
                defaultValue={search ?? ""}
                placeholder="Cari paket ujian..."
                className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
            <Button type="submit" size="sm">Cari</Button>
          </form>

          <div className="h-5 w-px bg-border/60" />

          {/* Status tabs */}
          <div className="flex gap-1 rounded-lg border p-1">
            {statusTabs.map((tab) => (
              <Link
                key={tab.value}
                href={buildHref({ status: tab.value, search: search ?? "" })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  (statusFilter ?? "") === tab.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="h-5 w-px bg-border/60" />

          {/* Sort pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Urut:</span>
            <div className="flex gap-1">
              {sortOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildHref({ sort: opt.value })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    sort === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {hasFilter && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" asChild>
              <Link href="/admin/packages">Reset</Link>
            </Button>
          )}
        </div>

        {hasFilter && (
          <p className="mt-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            Menampilkan{" "}
            <span className="font-medium text-foreground">{packages.length.toLocaleString("id-ID")}</span> paket
            {search && <> untuk &ldquo;{search}&rdquo;</>}
          </p>
        )}
      </div>

      {/* Table */}
      <PackagesTable packages={packages} hasFilter={hasFilter} />
    </div>
  );
}
