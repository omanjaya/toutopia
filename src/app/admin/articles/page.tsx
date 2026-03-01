import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Plus,
  Search,
  Newspaper,
  FileEdit,
  CheckCircle2,
  Eye,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { ArticleActions } from "./article-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Artikel" };

const ITEMS_PER_PAGE = 20;

const statusBadgeClass: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200",
  ARCHIVED: "bg-amber-500/10 text-amber-700 border-amber-200",
};

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const statusFilter = params.status ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Prisma.ArticleWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  if (statusFilter) {
    where.status = statusFilter as Prisma.ArticleWhereInput["status"];
  }

  const [articles, total, publishedCount, draftCount, totalViews] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }).then((r) => r._sum.viewCount ?? 0),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (overrides.q ?? q) p.set("q", overrides.q ?? q);
    if (overrides.status ?? statusFilter) p.set("status", overrides.status ?? statusFilter);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/articles?${p.toString()}`;
  }

  const statCards = [
    { title: "Published", value: publishedCount, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Draft", value: draftCount, icon: FileEdit, color: "bg-slate-500/10 text-slate-600" },
    { title: "Total Artikel", value: total, icon: Newspaper, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Views", value: totalViews, icon: Eye, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Artikel</h2>
          <p className="text-muted-foreground">Kelola artikel blog platform</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Buat Artikel
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
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
              <p className="text-2xl font-bold">{stat.value.toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form method="GET" action="/admin/articles" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari judul artikel..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <Button type="submit" size="sm">Cari</Button>
        </form>

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
      </div>

      {/* Article List */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3">
              <Newspaper className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {q || statusFilter ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
              </p>
              {!q && !statusFilter && (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/articles/new">Buat Artikel Pertama</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3.5 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{article.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className={statusBadgeClass[article.status] ?? ""}>
                    {article.status}
                  </Badge>
                  {article.category && (
                    <span className="rounded bg-muted px-1.5 py-0.5">{article.category}</span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {article.viewCount.toLocaleString("id-ID")}
                  </span>
                  <span>
                    {new Date(article.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {article.author.name && (
                    <span className="text-muted-foreground/70">{article.author.name}</span>
                  )}
                </div>
              </div>
              <ArticleActions articleId={article.id} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} artikel)
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
