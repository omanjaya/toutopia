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
  Newspaper,
  FileEdit,
  CheckCircle2,
  Eye,
  ImageIcon,
  TrendingUp,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { ArticleActions } from "./article-actions";
import { estimateFromHtml } from "@/shared/lib/reading-time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artikel — Admin" };

const ITEMS_PER_PAGE = 20;

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

type SortOption = "newest" | "oldest" | "views" | "published";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "published", label: "Terbaru Publish" },
  { value: "views", label: "Terbanyak Dilihat" },
  { value: "oldest", label: "Terlama" },
];

function getOrderBy(sort: SortOption): Prisma.ArticleOrderByWithRelationInput {
  switch (sort) {
    case "views":    return { viewCount: "desc" };
    case "published": return { publishedAt: "desc" };
    case "oldest":   return { createdAt: "asc" };
    default:         return { createdAt: "desc" };
  }
}

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    sort?: string;
    category?: string;
  }>;
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const statusFilter = params.status ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const sort = (params.sort ?? "newest") as SortOption;
  const categoryFilter = params.category ?? "";

  const where: Prisma.ArticleWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ];
  }
  if (statusFilter) {
    where.status = statusFilter as Prisma.ArticleWhereInput["status"];
  }
  if (categoryFilter) {
    where.category = { equals: categoryFilter, mode: "insensitive" };
  }

  const [
    articles,
    total,
    publishedCount,
    draftCount,
    totalViews,
    totalCount,
    categoryRows,
  ] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        content: true,
        status: true,
        category: true,
        tags: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article
      .aggregate({ _sum: { viewCount: true } })
      .then((r) => r._sum.viewCount ?? 0),
    prisma.article.count(),
    prisma.article.findMany({
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
    const r = {
      q:        overrides.q        ?? q,
      status:   overrides.status   ?? statusFilter,
      page:     overrides.page     ?? "",
      sort:     overrides.sort     ?? sort,
      category: overrides.category ?? categoryFilter,
    };
    if (r.q)                            p.set("q", r.q);
    if (r.status)                       p.set("status", r.status);
    if (r.page)                         p.set("page", r.page);
    if (r.sort && r.sort !== "newest")  p.set("sort", r.sort);
    if (r.category)                     p.set("category", r.category);
    return `/admin/articles?${p.toString()}`;
  }

  const statCards = [
    {
      title: "Total Artikel",
      value: totalCount,
      icon: Newspaper,
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
      icon: TrendingUp,
      color: "bg-violet-500/10 text-violet-600",
    },
  ];

  const activeFiltersCount = [q, statusFilter, categoryFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Artikel</h2>
          <p className="text-sm text-muted-foreground">
            Kelola artikel dan konten blog platform
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Buat Artikel
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-0 shadow-sm ring-1 ring-border/60"
          >
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
          <form method="GET" action="/admin/articles" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari judul atau kategori..."
                className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {statusFilter && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
            {sort !== "newest" && (
              <input type="hidden" name="sort" value={sort} />
            )}
            {categoryFilter && (
              <input type="hidden" name="category" value={categoryFilter} />
            )}
            <Button type="submit" size="sm" variant="secondary">
              Cari
            </Button>
          </form>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          {/* Status tabs */}
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
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
              <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
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
                    className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
        </div>

        {/* Active filter summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="text-xs text-muted-foreground">Filter aktif:</span>
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
              href="/admin/articles"
              className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Reset semua
            </Link>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{articles.length}</span>{" "}
        dari{" "}
        <span className="font-medium text-foreground">{total}</span> artikel
        {categoryFilter && (
          <span>
            {" "}dalam kategori <strong>{categoryFilter}</strong>
          </span>
        )}
        {q && (
          <span>
            {" "}untuk pencarian <strong>"{q}"</strong>
          </span>
        )}
      </p>

      {/* Article list */}
      {articles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Newspaper className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-medium">
                  {q || statusFilter || categoryFilter
                    ? "Tidak ada artikel yang cocok"
                    : "Belum ada artikel"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {q || statusFilter || categoryFilter
                    ? "Coba ubah atau hapus filter"
                    : "Mulai tulis artikel pertamamu"}
                </p>
              </div>
              {!q && !statusFilter && !categoryFilter && (
                <Button size="sm" asChild>
                  <Link href="/admin/articles/new">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Buat Artikel
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          {articles.map((article, idx) => {
            const statusCfg = STATUS_CONFIG[article.status];
            const readingTime = estimateFromHtml(article.content);
            const displayDate = article.publishedAt ?? article.createdAt;

            return (
              <div
                key={article.id}
                className={`flex items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/40 ${
                  idx !== 0 ? "border-t" : ""
                }`}
              >
                {/* Cover thumbnail */}
                <div className="relative mt-0.5 h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${statusCfg?.className ?? ""}`}
                    >
                      {statusCfg?.label ?? article.status}
                    </Badge>
                    {article.category && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {article.category}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 font-semibold leading-snug line-clamp-1">
                    {article.title}
                  </p>

                  {article.excerpt ? (
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2 leading-snug">
                      {article.excerpt}
                    </p>
                  ) : null}

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {article.author.name && (
                      <span>{article.author.name}</span>
                    )}
                    <span>
                      {displayDate.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.viewCount.toLocaleString("id-ID")}
                    </span>
                    {readingTime && (
                      <span>{readingTime.short} baca</span>
                    )}
                    {article.tags.length > 0 && (
                      <span className="hidden sm:inline">
                        {article.tags.slice(0, 3).join(", ")}
                        {article.tags.length > 3 && ` +${article.tags.length - 3}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 pt-0.5">
                  <ArticleActions
                    articleId={article.id}
                    articleSlug={article.slug}
                    status={article.status}
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
                <Link href={buildUrl({ page: String(page - 1) })}>
                  Sebelumnya
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
