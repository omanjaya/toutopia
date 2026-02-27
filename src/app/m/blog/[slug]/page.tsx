import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Share2 } from "lucide-react";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { MobileShareButton } from "./share-button-mobile";

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

async function getRelatedArticles(
  articleId: string,
  category: string | null
) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: articleId },
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      category: true,
      publishedAt: true,
    },
  });
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Artikel Tidak Ditemukan" };

  return {
    title: `${article.title}`,
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

export default async function MobileBlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const relatedArticles = await getRelatedArticles(
    article.id,
    article.category
  );

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id"}/blog/${slug}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/m/blog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="truncate text-sm font-medium">
            {article.title}
          </span>
        </div>
        <MobileShareButton url={shareUrl} title={article.title} />
      </div>

      {/* Cover image */}
      {article.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Article content */}
      <div className="px-4 pt-5">
        {/* Category badge */}
        {article.category && (
          <Badge variant="secondary" className="mb-3">
            {article.category}
          </Badge>
        )}

        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Meta info */}
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{article.author.name}</span>
          <span>&middot;</span>
          <time>
            {article.publishedAt?.toLocaleDateString("id-ID", {
              dateStyle: "long",
            })}
          </time>
        </div>

        {/* Article body */}
        <div
          className="prose prose-sm mt-6 max-w-none overflow-hidden break-words dark:prose-invert [&_img]:max-w-full [&_img]:h-auto [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_iframe]:max-w-full [&_video]:max-w-full"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="mb-4 text-base font-semibold">Artikel Terkait</h3>
            <div className="space-y-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/m/blog/${related.slug}`}
                  className="flex items-center gap-3 rounded-lg border p-3 active:bg-muted transition-colors"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {related.coverImage ? (
                      <Image
                        src={related.coverImage}
                        alt={related.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ArrowLeft className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight line-clamp-2">
                      {related.title}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {related.publishedAt
                        ? new Date(related.publishedAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" }
                          )
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
