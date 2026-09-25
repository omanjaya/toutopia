import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
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

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

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
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-12 md:py-12">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Blog</h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:mt-2 md:text-base">
          Tips belajar, strategi ujian, dan informasi terbaru
        </p>
      </div>

      <BlogFilters categories={categories} currentCategory={category} currentQuery={q} />

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
        <>
          {/* Mobile: list layout */}
          <div className="space-y-3 sm:hidden">
            {articles.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`}>
                <div className={`${cardCls} overflow-hidden transition-transform active:scale-[0.98]`}>
                  <div className="flex gap-3 p-3">
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
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        {article.category && (
                          <Badge className="mb-1 bg-muted px-1.5 py-0 text-[10px] text-foreground">
                            {article.category}
                          </Badge>
                        )}
                        <h2 className="line-clamp-2 text-sm font-semibold leading-tight">
                          {article.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{article.author.name}</span>
                        <span>&middot;</span>
                        <span>
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: grid layout */}
          <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`}>
                <div className={`${cardCls} h-full overflow-hidden transition-shadow hover:shadow-lg`}>
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {article.category && (
                      <Badge className="mb-2 bg-muted text-foreground">
                        {article.category}
                      </Badge>
                    )}
                    <h2 className="line-clamp-2 font-semibold leading-tight">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{article.author.name}</span>
                      <span>&middot;</span>
                      <span>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                              dateStyle: "medium",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
