import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import { MobileBlogFilters } from "./blog-filters-mobile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artikel, tips belajar, dan informasi terbaru seputar try out UTBK, CPNS, BUMN, dan lainnya.",
  openGraph: {
    title: "Blog - Toutopia",
    description:
      "Artikel, tips belajar, dan informasi terbaru seputar try out.",
  },
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
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

async function getCategories(): Promise<string[]> {
  const results = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });
  return results.map((r) => r.category).filter(Boolean) as string[];
}

export default async function MobileBlogPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const [articles, categories] = await Promise.all([
    getArticles(category, q),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/m"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Blog</h1>
          <p className="text-xs text-muted-foreground">
            Tips belajar & info terbaru
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Filters */}
        <MobileBlogFilters
          categories={categories}
          currentCategory={category}
          currentQuery={q}
        />

        {/* Article List */}
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold">Tidak ada artikel</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {q || category
                ? "Tidak ada artikel yang sesuai filter. Coba kata kunci lain."
                : "Belum ada artikel tersedia saat ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/m/blog/${article.slug}`}>
                <Card className="overflow-hidden active:scale-[0.98] transition-transform">
                  <div className="flex gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        {article.category && (
                          <Badge
                            variant="secondary"
                            className="mb-1 text-[10px] px-1.5 py-0"
                          >
                            {article.category}
                          </Badge>
                        )}
                        <h2 className="text-sm font-semibold leading-tight line-clamp-2">
                          {article.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{article.author.name}</span>
                        <span>&middot;</span>
                        <span>
                          {article.publishedAt
                            ? new Date(
                                article.publishedAt
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
