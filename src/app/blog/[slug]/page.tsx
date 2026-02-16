import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, avatar: true } },
    },
  });

  if (!article || article.status !== "PUBLISHED") return null;

  // Increment view count (fire-and-forget)
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  return article;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Artikel Tidak Ditemukan" };

  return {
    title: `${article.title} - Toutopia`,
    description: article.excerpt ?? article.content.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.excerpt ?? article.content.substring(0, 160),
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author.name ? [article.author.name] : undefined,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Blog
        </Link>
      </Button>

      {article.category && (
        <Badge variant="secondary" className="mb-3">
          {article.category}
        </Badge>
      )}

      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
        {article.title}
      </h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <span>{article.author.name}</span>
        <span>&middot;</span>
        <time>
          {article.publishedAt?.toLocaleDateString("id-ID", {
            dateStyle: "long",
          })}
        </time>
      </div>

      {article.coverImage && (
        <div className="mt-8 overflow-hidden rounded-lg">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-lg mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
