import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
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
import { Plus, Eye, Package, BookOpen, Archive, FileEdit, Layers, Search } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Paket Ujian",
};

const statusBadgeClass: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400",
  ARCHIVED: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
};

const statusLabel: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

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
  searchParams: Promise<{ sort?: string; search?: string }>;
}) {
  const { sort: rawSort, search } = await searchParams;
  const sort: SortOption =
    rawSort === "oldest" ||
    rawSort === "popular" ||
    rawSort === "price_high" ||
    rawSort === "price_low"
      ? rawSort
      : "newest";

  const packages = await prisma.examPackage.findMany({
    where: search
      ? { title: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: getOrderBy(sort),
    include: {
      category: { select: { name: true } },
      _count: { select: { attempts: true } },
    },
  });

  const publishedCount = packages.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = packages.filter((p) => p.status === "DRAFT").length;
  const archivedCount = packages.filter((p) => p.status === "ARCHIVED").length;
  const totalAttempts = packages.reduce((s, p) => s + p._count.attempts, 0);

  const statCards = [
    { title: "Published", value: publishedCount, icon: BookOpen, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Draft", value: draftCount, icon: FileEdit, color: "bg-slate-500/10 text-slate-600" },
    { title: "Archived", value: archivedCount, icon: Archive, color: "bg-amber-500/10 text-amber-600" },
    { title: "Total Peserta", value: totalAttempts, icon: Package, color: "bg-blue-500/10 text-blue-600" },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "popular", label: "Terpopuler" },
    { value: "price_high", label: "Harga Tertinggi" },
    { value: "price_low", label: "Harga Terendah" },
  ];

  function buildHref(params: { sort?: string; search?: string }): string {
    const qs = new URLSearchParams();
    const s = params.sort ?? sort;
    const q = params.search !== undefined ? params.search : (search ?? "");
    if (s && s !== "newest") qs.set("sort", s);
    if (q) qs.set("search", q);
    const str = qs.toString();
    return `/admin/packages${str ? `?${str}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paket Ujian</h2>
          <p className="text-muted-foreground">
            Kelola paket try out yang tersedia di platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/packages/series/new">
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              Buat Seri Paket
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
              <div className="text-2xl font-bold">{stat.value.toLocaleString("id-ID")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/packages" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Cari paket ujian..."
            className="pl-9"
          />
        </div>
        {/* Preserve sort in hidden input */}
        {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
        <Button type="submit" variant="secondary" size="sm">
          Cari
        </Button>

        {/* Sort links (GET-based navigation) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Urutkan:</span>
          {sortOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildHref({ sort: opt.value })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                sort === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Paket</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Soal</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  <Link href={`/admin/packages/${pkg.id}`} className="text-sm font-medium hover:underline">
                    {pkg.title}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {pkg.category.name}
                </TableCell>
                <TableCell className="text-sm">
                  {pkg.isFree ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                      Gratis
                    </Badge>
                  ) : (
                    <span className="font-medium">{formatCurrency(pkg.price)}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {pkg.totalQuestions}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {pkg.durationMinutes} min
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {pkg._count.attempts.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClass[pkg.status] ?? ""}>
                    {statusLabel[pkg.status] ?? pkg.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/packages/${pkg.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {packages.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {search ? `Tidak ada paket untuk "${search}"` : "Belum ada paket ujian"}
                    </p>
                    {!search && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/admin/packages/new">Buat Paket Pertama</Link>
                      </Button>
                    )}
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
