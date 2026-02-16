import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

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

async function getArticles() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
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

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Tips belajar, strategi ujian, dan informasi terbaru
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Belum ada artikel
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                {article.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
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
