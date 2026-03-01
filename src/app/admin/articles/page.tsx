import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
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
  CalendarDays,
  User,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { ArticleActions } from "./article-actions";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

// Reading time estimated from excerpt — avoids fetching full content on list
function estimateReadTime(excerpt: string | null): string | null {
  if (!excerpt) return null;
  const words = excerpt.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round((words * 8) / 250));
  return mins < 60 ? `${mins} mnt` : `${Math.floor(mins / 60)}j ${mins % 60}m`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artikel — Admin" };

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  PUBLISHED: {
    label: "Published",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  DRAFT: {
    label: "Draft",
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-200",
  },
  ARCHIVED: {
    label: "Archived",
    dotClass: "bg-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
};

type SortOption = "newest" | "oldest" | "views" | "published";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Terbaru Dibuat" },
  { value: "published", label: "Terbaru Publish" },
  { value: "views", label: "Terbanyak Dilihat" },
  { value: "oldest", label: "Terlama" },
];

function getOrderBy(sort: SortOption): Prisma.ArticleOrderByWithRelationInput {
  switch (sort) {
    case "views":     return { viewCount: "desc" };
    case "published": return { publishedAt: "desc" };
    case "oldest":    return { createdAt: "asc" };
    default:          return { createdAt: "desc" };
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
  if (statusFilter) where.status = statusFilter as Prisma.ArticleWhereInput["status"];
  if (categoryFilter) where.category = { equals: categoryFilter, mode: "insensitive" };

  const [
    articles, total,
    publishedCount, draftCount, totalViews, totalCount,
    categoryRows,
  ] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: {
        id: true, title: true, slug: true,
        excerpt: true, coverImage: true,
        status: true, category: true, tags: true,
        viewCount: true, publishedAt: true, createdAt: true, updatedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }).then((r) => r._sum.viewCount ?? 0),
    prisma.article.count(),
    prisma.article.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const categories = categoryRows.map((r) => r.category).filter((c): c is string => !!c);
  const hasFilters = !!(q || statusFilter || categoryFilter);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    const r = {
      q:        overrides.q        ?? q,
      status:   overrides.status   ?? statusFilter,
      page:     overrides.page     ?? "",
      sort:     overrides.sort     ?? sort,
      category: overrides.category ?? categoryFilter,
    };
    if (r.q)                           p.set("q", r.q);
    if (r.status)                      p.set("status", r.status);
    if (r.page)                        p.set("page", r.page);
    if (r.sort && r.sort !== "newest") p.set("sort", r.sort);
    if (r.category)                    p.set("category", r.category);
    return `/admin/articles?${p.toString()}`;
  }

  const statCards = [
    { title: "Total Artikel", value: totalCount,      icon: Newspaper,     color: "bg-primary/10 text-primary" },
    { title: "Published",     value: publishedCount,  icon: CheckCircle2,  color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Draft",         value: draftCount,      icon: FileEdit,      color: "bg-slate-500/10 text-slate-600" },
    { title: "Total Views",   value: totalViews,      icon: TrendingUp,    color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Artikel</h2>
            <p className="text-sm text-muted-foreground">Kelola artikel dan konten blog platform</p>
          </div>
        </div>
        <Button size="sm" asChild className="self-start">
          <Link href="/admin/articles/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Buat Artikel
          </Link>
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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

      {/* ── Filter Bar ── */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <form method="GET" action="/admin/articles" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari judul, kategori..."
                className="h-8 w-52 rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
            {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
            <Button type="submit" size="sm" variant="secondary" className="h-8 px-3 text-xs">
              Cari
            </Button>
          </form>

          <Separator orientation="vertical" className="hidden h-5 sm:block" />

          {/* Status tabs */}
          <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
            {[
              { value: "", label: "Semua" },
              { value: "DRAFT", label: "Draft" },
              { value: "PUBLISHED", label: "Published" },
              { value: "ARCHIVED", label: "Archived" },
            ].map((s) => (
              <Link
                key={s.value}
                href={buildUrl({ status: s.value, page: "1" })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
                {s.value === "DRAFT" && draftCount > 0 && (
                  <span className={`ml-1.5 rounded-full px-1 py-0 text-[10px] tabular-nums ${
                    statusFilter === s.value ? "bg-muted text-muted-foreground" : "bg-background text-muted-foreground"
                  }`}>
                    {draftCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: "1" })}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  sort === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Kategori:</span>
              <div className="flex flex-wrap gap-1">
                <Link
                  href={buildUrl({ category: "", page: "1" })}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    !categoryFilter
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  Semua
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={buildUrl({ category: cat, page: "1" })}
                    className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="text-xs text-muted-foreground">Filter:</span>
            {q && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                "{q}"
              </span>
            )}
            {statusFilter && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {STATUS_CONFIG[statusFilter]?.label ?? statusFilter}
              </span>
            )}
            {categoryFilter && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
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

      {/* ── Results info ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> artikel
          {hasFilters && (
            <span className="text-muted-foreground/70"> (difilter dari {totalCount})</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Hal. {page}/{Math.max(1, totalPages)}
        </p>
      </div>

      {/* ── Article list ── */}
      {articles.length === 0 ? (
        <div className={`${cardCls} py-16 text-center`}>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Newspaper className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium">
                {hasFilters ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters ? "Coba ubah atau hapus filter" : "Mulai tulis artikel pertamamu"}
              </p>
            </div>
            {!hasFilters && (
              <Button size="sm" asChild>
                <Link href="/admin/articles/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Buat Artikel
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          {articles.map((article, idx) => {
            const statusCfg = STATUS_CONFIG[article.status];
            const readTime = estimateReadTime(article.excerpt);
            const displayDate = article.publishedAt ?? article.createdAt;

            return (
              <div
                key={article.id}
                className={`group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${
                  idx !== 0 ? "border-t" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="relative mt-0.5 h-[4.5rem] w-32 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/40">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="128px"
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/25" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  {/* Status + category row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusCfg?.badgeClass ?? ""}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg?.dotClass ?? "bg-muted-foreground"}`} />
                      {statusCfg?.label ?? article.status}
                    </span>
                    {article.category && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {article.category}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                    {article.title}
                  </p>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                    {article.author.name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(displayDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.viewCount.toLocaleString("id-ID")}
                    </span>
                    {readTime && (
                      <span>~{readTime} baca</span>
                    )}
                    {/* Tags */}
                    {article.tags.length > 0 && (
                      <span className="hidden items-center gap-1 sm:flex">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-1.5 py-0 text-[10px]">
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 2 && (
                          <span className="text-[10px] text-muted-foreground/60">
                            +{article.tags.length - 2}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 self-center">
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            Halaman <span className="font-medium text-foreground">{page}</span> dari{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>← Sebelumnya</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>Selanjutnya →</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
