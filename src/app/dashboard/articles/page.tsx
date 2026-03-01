import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { auth } from "@/shared/lib/auth";
import { Newspaper, Eye, Search, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artikel - Toutopia",
  description: "Kumpulan artikel tips, strategi, dan panduan persiapan ujian.",
};

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

async function getArticles(category?: string, query?: string) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { excerpt: { contains: query, mode: "insensitive" as const } },
              { category: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      tags: true,
      viewCount: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

async function getCategories(): Promise<string[]> {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category).filter(Boolean) as string[];
}

export default async function ArticlesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { category, q } = await searchParams;
  const [articles, categories] = await Promise.all([
    getArticles(category, q),
    getCategories(),
  ]);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artikel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tips, strategi, dan panduan persiapan ujian
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Newspaper className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Search + Category pills */}
      <div className="space-y-3">
        <form method="GET" action="/dashboard/articles" className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Cari artikel..."
              className="pl-9 h-9"
            />
          </div>
          {category && <input type="hidden" name="category" value={category} />}
          <Button type="submit" size="sm" className="h-9">Cari</Button>
        </form>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/articles"
              className={`h-7 rounded-full px-3.5 text-xs font-medium transition-colors ${
                !category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              Semua
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/dashboard/articles?category=${encodeURIComponent(cat)}`}
                className={`h-7 rounded-full px-3.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Newspaper className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="mt-4 font-medium text-muted-foreground">
            {q || category ? "Tidak ada artikel yang sesuai" : "Belum ada artikel"}
          </p>
          {(q || category) && (
            <p className="mt-1 text-sm text-muted-foreground/60">
              Coba hapus filter atau ubah kata kunci
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured article — full width */}
          {featured && !q && !category && (
            <Link href={`/dashboard/articles/${featured.slug}`} className="group block">
              <div className="overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:shadow-md hover:ring-border">
                <div className="flex flex-col sm:flex-row">
                  {/* Cover */}
                  <div className="relative h-52 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-72">
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, 288px"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                        <BookOpen className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground shadow">
                        TERBARU
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-1 flex-col justify-center gap-3 p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {featured.category && (
                        <Badge variant="secondary" className="font-normal text-xs">
                          {featured.category}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-bold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {featured.author.name && <span>{featured.author.name}</span>}
                      {featured.publishedAt && (
                        <span>
                          {featured.publishedAt.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {featured.viewCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {featured.viewCount.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Article grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(q || category ? articles : rest).map((article) => (
                <Link
                  key={article.id}
                  href={`/dashboard/articles/${article.slug}`}
                  className="group"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-border">
                    {/* Cover */}
                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <Newspaper className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                      )}
                      {article.category && (
                        <div className="absolute left-2.5 top-2.5">
                          <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-sm">
                            {article.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h2 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <span>
                          {article.publishedAt?.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-2.5">
                          {article.viewCount > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Eye className="h-3 w-3" />
                              {article.viewCount.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
