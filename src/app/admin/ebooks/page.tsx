import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Plus,
  Search,
  BookText,
  FileEdit,
  CheckCircle2,
  Eye,
  Download,
  LayoutGrid,
  List,
  BookOpen,
  Tag,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { EbookActions } from "./ebook-actions";
import { formatCurrency } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ebook — Admin" };

const ITEMS_PER_PAGE = 24;

const statusBadgeClass: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200",
  ARCHIVED: "bg-amber-500/10 text-amber-700 border-amber-200",
};

const statusLabel: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

type SortOption = "newest" | "views" | "downloads" | "published";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Terbaru Dibuat" },
  { value: "views", label: "Terbanyak Dilihat" },
  { value: "downloads", label: "Terbanyak Diunduh" },
  { value: "published", label: "Terbaru Publish" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getOrderBy(sort: SortOption): Prisma.EbookOrderByWithRelationInput {
  switch (sort) {
    case "views":
      return { viewCount: "desc" };
    case "downloads":
      return { downloadCount: "desc" };
    case "published":
      return { publishedAt: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    sort?: string;
    category?: string;
    view?: string;
  }>;
}

export default async function AdminEbooksPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const statusFilter = params.status ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const sort = (params.sort ?? "newest") as SortOption;
  const categoryFilter = params.category ?? "";
  const viewMode = params.view === "list" ? "list" : "grid";

  const where: Prisma.EbookWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  if (statusFilter) {
    where.status = statusFilter as Prisma.EbookWhereInput["status"];
  }

  if (categoryFilter) {
    where.category = { equals: categoryFilter, mode: "insensitive" };
  }

  const [ebooks, total, publishedCount, draftCount, totalViews, totalDownloads, totalCount, paidCount, categoryRows] =
    await Promise.all([
      prisma.ebook.findMany({
        where,
        orderBy: getOrderBy(sort),
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: {
          id: true,
          title: true,
          slug: true,
          contentType: true,
          status: true,
          category: true,
          viewCount: true,
          downloadCount: true,
          publishedAt: true,
          createdAt: true,
          price: true,
          isFree: true,
          fileSize: true,
          pageCount: true,
          tags: true,
          coverImage: true,
          author: { select: { name: true } },
        },
      }),
      prisma.ebook.count({ where }),
      prisma.ebook.count({ where: { status: "PUBLISHED" } }),
      prisma.ebook.count({ where: { status: "DRAFT" } }),
      prisma.ebook.aggregate({ _sum: { viewCount: true } }).then((r) => r._sum.viewCount ?? 0),
      prisma.ebook.aggregate({ _sum: { downloadCount: true } }).then((r) => r._sum.downloadCount ?? 0),
      prisma.ebook.count(),
      prisma.ebook.count({ where: { isFree: false } }),
      prisma.ebook.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      }),
    ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const categories = categoryRows
    .map((r) => r.category)
    .filter((c): c is string => c !== null && c.length > 0);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    const resolved = {
      q: overrides.q ?? q,
      status: overrides.status ?? statusFilter,
      page: overrides.page ?? "",
      sort: overrides.sort ?? sort,
      category: overrides.category ?? categoryFilter,
      view: overrides.view ?? viewMode,
    };
    if (resolved.q) p.set("q", resolved.q);
    if (resolved.status) p.set("status", resolved.status);
    if (resolved.page) p.set("page", resolved.page);
    if (resolved.sort && resolved.sort !== "newest") p.set("sort", resolved.sort);
    if (resolved.category) p.set("category", resolved.category);
    if (resolved.view && resolved.view !== "grid") p.set("view", resolved.view);
    return `/admin/ebooks?${p.toString()}`;
  }

  const statCards = [
    {
      title: "Total Ebook",
      value: totalCount,
      icon: BookOpen,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Published",
      value: publishedCount,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Draft",
      value: draftCount,
      icon: FileEdit,
      color: "bg-slate-500/10 text-slate-600",
    },
    {
      title: "Total Views",
      value: totalViews,
      icon: Eye,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Download",
      value: totalDownloads,
      icon: Download,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Berbayar",
      value: paidCount,
      icon: Tag,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ebook</h2>
          <p className="text-muted-foreground">Kelola ebook dan materi belajar</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/ebooks/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Upload Ebook
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value.toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form method="GET" action="/admin/ebooks" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari judul ebook..."
              className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
          {viewMode !== "grid" && <input type="hidden" name="view" value={viewMode} />}
          <Button type="submit" size="sm">Cari</Button>
        </form>

        {/* Status Tabs */}
        <div className="flex gap-1 rounded-lg border p-1">
          {[
            { value: "", label: "Semua" },
            { value: "DRAFT", label: "Draft" },
            { value: "PUBLISHED", label: "Published" },
            { value: "ARCHIVED", label: "Archived" },
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

        {/* Sort quick links */}
        <div className="flex gap-1 rounded-lg border p-1">
          {sortOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ sort: opt.value, page: "1" })}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                sort === opt.value
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Category Select */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Kategori:</label>
            <div className="flex gap-1 rounded-lg border p-1">
              <Link
                href={buildUrl({ category: "", page: "1" })}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  categoryFilter === ""
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Semua
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={buildUrl({ category: cat, page: "1" })}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="ml-auto flex gap-1 rounded-lg border p-1">
          <Link
            href={buildUrl({ view: "grid" })}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={buildUrl({ view: "list" })}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Menampilkan {ebooks.length} dari {total} ebook
        {categoryFilter && ` dalam kategori "${categoryFilter}"`}
        {q && ` untuk pencarian "${q}"`}
      </p>

      {/* Ebook List / Grid */}
      {ebooks.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3">
              <BookText className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {q || statusFilter || categoryFilter
                  ? "Tidak ada ebook yang cocok dengan filter"
                  : "Belum ada ebook"}
              </p>
              {!q && !statusFilter && !categoryFilter && (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/ebooks/new">Upload Ebook Pertama</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* ===== GRID VIEW ===== */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ebooks.map((ebook) => (
            <Card
              key={ebook.id}
              className="group overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Cover Image */}
              <div className="relative h-40 w-full overflow-hidden bg-muted">
                {ebook.coverImage ? (
                  <Image
                    src={ebook.coverImage}
                    alt={ebook.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookText className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                {/* Status Badge overlay */}
                <div className="absolute right-2 top-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold backdrop-blur-sm ${statusBadgeClass[ebook.status] ?? ""}`}
                  >
                    {statusLabel[ebook.status] ?? ebook.status}
                  </Badge>
                </div>
                {/* Free/Paid badge */}
                <div className="absolute left-2 top-2">
                  {ebook.isFree ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Gratis
                    </Badge>
                  ) : (
                    <Badge className="text-[10px] bg-amber-500 hover:bg-amber-500/90">
                      Berbayar
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-3">
                {/* Title */}
                <p className="line-clamp-2 font-medium leading-snug" title={ebook.title}>
                  {ebook.title}
                </p>

                {/* Category and Type */}
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {ebook.category && (
                    <span className="rounded bg-muted px-1.5 py-0.5 truncate max-w-[100px]">
                      {ebook.category}
                    </span>
                  )}
                  <span className="shrink-0">{ebook.contentType}</span>
                  {ebook.pageCount && (
                    <span className="shrink-0">{ebook.pageCount} hal</span>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {ebook.viewCount.toLocaleString("id-ID")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {ebook.downloadCount.toLocaleString("id-ID")}
                  </span>
                  {ebook.fileSize && (
                    <span className="ml-auto text-[10px]">{formatFileSize(ebook.fileSize)}</span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-2 text-sm font-semibold">
                  {ebook.isFree ? (
                    <span className="text-emerald-600">Gratis</span>
                  ) : (
                    <span>{formatCurrency(ebook.price)}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 border-t pt-3">
                  <EbookActions
                    ebookId={ebook.id}
                    ebookSlug={ebook.slug}
                    status={ebook.status}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ===== LIST VIEW ===== */
        <div className="space-y-2">
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              className="flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {ebook.coverImage ? (
                  <Image
                    src={ebook.coverImage}
                    alt={ebook.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookText className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{ebook.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${statusBadgeClass[ebook.status] ?? ""}`}
                  >
                    {statusLabel[ebook.status] ?? ebook.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {ebook.contentType}
                  </Badge>
                  {ebook.category && (
                    <span className="rounded bg-muted px-1.5 py-0.5">{ebook.category}</span>
                  )}
                  {ebook.isFree ? (
                    <span className="font-medium text-emerald-600">Gratis</span>
                  ) : (
                    <span className="font-medium text-amber-600">{formatCurrency(ebook.price)}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {ebook.viewCount.toLocaleString("id-ID")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {ebook.downloadCount.toLocaleString("id-ID")}
                  </span>
                  {ebook.fileSize && <span>{formatFileSize(ebook.fileSize)}</span>}
                  <span>
                    {new Date(ebook.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {ebook.author.name && (
                    <span className="text-muted-foreground/70">{ebook.author.name}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0">
                <EbookActions
                  ebookId={ebook.id}
                  ebookSlug={ebook.slug}
                  status={ebook.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} ebook)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>Sebelumnya</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>Selanjutnya</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
