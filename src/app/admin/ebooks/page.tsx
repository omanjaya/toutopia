import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-slate-500/10 text-slate-600 border-slate-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
};

type SortOption = "newest" | "views" | "downloads" | "published";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "views", label: "Terbanyak Dilihat" },
  { value: "downloads", label: "Terbanyak Diunduh" },
  { value: "published", label: "Terbaru Publish" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  const [
    ebooks,
    total,
    publishedCount,
    draftCount,
    totalViews,
    totalDownloads,
    totalCount,
    paidCount,
    categoryRows,
  ] = await Promise.all([
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
    prisma.ebook
      .aggregate({ _sum: { viewCount: true } })
      .then((r) => r._sum.viewCount ?? 0),
    prisma.ebook
      .aggregate({ _sum: { downloadCount: true } })
      .then((r) => r._sum.downloadCount ?? 0),
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

  const activeFiltersCount = [q, statusFilter, categoryFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ebook</h2>
          <p className="text-sm text-muted-foreground">
            Kelola ebook dan materi belajar platform
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/ebooks/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Upload Ebook
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <p className="text-2xl font-bold tabular-nums">
                {stat.value.toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form method="GET" action="/admin/ebooks" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari judul ebook..."
                className="h-9 w-52 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
            {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
            {viewMode !== "grid" && <input type="hidden" name="view" value={viewMode} />}
            <Button type="submit" size="sm" variant="secondary">
              Cari
            </Button>
          </form>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Status Tabs */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
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
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: "1" })}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  sort === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Kategori:</span>
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                <Link
                  href={buildUrl({ category: "", page: "1" })}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === ""
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
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
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* View Toggle (push to right) */}
          <div className="ml-auto flex gap-1 rounded-lg bg-muted p-1">
            <Link
              href={buildUrl({ view: "grid" })}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tampilan grid"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={buildUrl({ view: "list" })}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tampilan list"
            >
              <List className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Active filter summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex items-center gap-2 border-t pt-3">
            <span className="text-xs text-muted-foreground">
              Filter aktif:
            </span>
            {q && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                "{q}"
              </span>
            )}
            {statusFilter && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {STATUS_CONFIG[statusFilter]?.label ?? statusFilter}
              </span>
            )}
            {categoryFilter && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {categoryFilter}
              </span>
            )}
            <Link
              href="/admin/ebooks"
              className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Reset semua
            </Link>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{ebooks.length}</span> dari{" "}
        <span className="font-medium text-foreground">{total}</span> ebook ditampilkan
        {categoryFilter && (
          <span> dalam kategori <strong>{categoryFilter}</strong></span>
        )}
        {q && (
          <span> untuk pencarian <strong>"{q}"</strong></span>
        )}
      </p>

      {/* Content */}
      {ebooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <BookText className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-medium">
                  {q || statusFilter || categoryFilter
                    ? "Tidak ada ebook yang cocok"
                    : "Belum ada ebook"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {q || statusFilter || categoryFilter
                    ? "Coba ubah atau hapus filter yang aktif"
                    : "Upload ebook pertama untuk mulai"}
                </p>
              </div>
              {!q && !statusFilter && !categoryFilter && (
                <Button size="sm" asChild>
                  <Link href="/admin/ebooks/new">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Upload Ebook
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {ebooks.map((ebook) => {
            const statusCfg = STATUS_CONFIG[ebook.status];
            return (
              <Card
                key={ebook.id}
                className="group overflow-hidden border-0 shadow-[3px_4px_16px_rgba(0,0,0,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_8px_24px_rgba(0,0,0,0.16)]"
              >
                {/* Book cover — portrait */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/60">
                  {/* Spine */}
                  <div className="absolute inset-y-0 left-0 z-10 w-2.5 bg-gradient-to-r from-black/20 to-transparent" />

                  {ebook.coverImage ? (
                    <Image
                      src={ebook.coverImage}
                      alt={ebook.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-3">
                      <BookText className="h-10 w-10 text-muted-foreground/25" />
                      <p className="text-center text-[10px] leading-snug text-muted-foreground/50 line-clamp-4">
                        {ebook.title}
                      </p>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Status badge — top right */}
                  <div className="absolute right-1.5 top-1.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm ${statusCfg?.className ?? ""}`}
                    >
                      {statusCfg?.label ?? ebook.status}
                    </span>
                  </div>

                  {/* Free/Paid — top left */}
                  <div className="absolute left-1.5 top-1.5">
                    {ebook.isFree ? (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                        Gratis
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                        Berbayar
                      </span>
                    )}
                  </div>

                  {/* Stats — bottom right */}
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5 rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-sm">
                      <Eye className="h-2 w-2" />
                      {ebook.viewCount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <CardContent className="p-3">
                  <p
                    className="line-clamp-2 text-xs font-semibold leading-snug"
                    title={ebook.title}
                  >
                    {ebook.title}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    {ebook.category && (
                      <span className="max-w-[70px] truncate rounded bg-muted px-1 py-0.5">
                        {ebook.category}
                      </span>
                    )}
                    <span>{ebook.contentType}</span>
                    {ebook.pageCount && <span>· {ebook.pageCount}h</span>}
                  </div>

                  <div className="mt-1.5 text-xs font-semibold">
                    {ebook.isFree ? (
                      <span className="text-emerald-600">Gratis</span>
                    ) : (
                      <span>{formatCurrency(ebook.price)}</span>
                    )}
                  </div>

                  <div className="mt-2.5 border-t pt-2.5">
                    <EbookActions
                      ebookId={ebook.id}
                      ebookSlug={ebook.slug}
                      status={ebook.status}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List */
        <div className="overflow-hidden rounded-xl border">
          {ebooks.map((ebook, idx) => {
            const statusCfg = STATUS_CONFIG[ebook.status];
            return (
              <div
                key={ebook.id}
                className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40 ${
                  idx !== 0 ? "border-t" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                  {ebook.coverImage ? (
                    <Image
                      src={ebook.coverImage}
                      alt={ebook.title}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookText className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{ebook.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${statusCfg?.className ?? ""}`}
                    >
                      {statusCfg?.label ?? ebook.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {ebook.contentType}
                    </Badge>
                    {ebook.category && (
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        {ebook.category}
                      </span>
                    )}
                    {ebook.isFree ? (
                      <span className="font-medium text-emerald-600">Gratis</span>
                    ) : (
                      <span className="font-medium text-amber-600">
                        {formatCurrency(ebook.price)}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {ebook.viewCount.toLocaleString("id-ID")}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Download className="h-3 w-3" />
                      {ebook.downloadCount.toLocaleString("id-ID")}
                    </span>
                    {ebook.fileSize && <span>{formatFileSize(ebook.fileSize)}</span>}
                    <span className="text-muted-foreground/60">
                      {new Date(ebook.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
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
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
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
