import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { FileText } from "lucide-react";
import { BlogFilters } from "./blog-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog - Toutopia",
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

export default async function BlogPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const [articles, categories] = await Promise.all([
    getArticles(category, q),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Tips belajar, strategi ujian, dan informasi terbaru
        </p>
      </div>

      <BlogFilters categories={categories} currentCategory={category} currentQuery={q} />

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">
            {q || category ? "Tidak ada artikel yang sesuai filter" : "Belum ada artikel"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  {article.category && (
                    <Badge variant="secondary" className="mb-2">
                      {article.category}
                    </Badge>
                  )}
                  <h2 className="font-semibold leading-tight line-clamp-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.author.name}</span>
                    <span>&middot;</span>
                    <span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(
                            "id-ID",
                            { dateStyle: "medium" }
                          )
                        : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
