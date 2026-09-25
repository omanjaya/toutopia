import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ShareButtons } from "@/shared/components/shared/share-buttons";
import { sanitizeHtml } from "@/shared/lib/sanitize";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getRelatedArticles(articleId: string, category: string | null) {
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

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";
  const canonicalUrl = `${BASE_URL}/blog/${article.slug}`;
  const description = article.excerpt ?? article.content.substring(0, 160);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: canonicalUrl,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: article.author.name ? [article.author.name] : undefined,
      images: article.coverImage
        ? [{ url: article.coverImage, alt: article.title }]
        : [{ url: "/images/og.png", width: 1200, height: 630, alt: "Toutopia Blog" }],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.coverImage ? [article.coverImage] : ["/images/og.png"],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const relatedArticles = await getRelatedArticles(article.id, article.category);

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? article.content.substring(0, 160),
    url: `${BASE_URL}/blog/${slug}`,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name ?? "Toutopia",
    },
    publisher: {
      "@type": "Organization",
      name: "Toutopia",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/icons/icon-192x192.png` },
    },
    ...(article.coverImage ? { image: article.coverImage } : {}),
    keywords: article.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="min-h-screen bg-background pb-24 md:pb-0">
        {/* Mobile sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/blog"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="truncate text-sm font-medium">{article.title}</span>
          </div>
        </div>

        {/* Cover image */}
        {article.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted md:hidden">
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

        <article className="mx-auto max-w-3xl px-4 py-5 md:py-12">
          {/* Desktop back button */}
          <Button variant="ghost" size="sm" className="mb-6 hidden md:flex" asChild>
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

          <h1 className="text-xl font-bold tracking-tight leading-tight md:text-3xl lg:text-4xl">
            {article.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground md:mt-4 md:gap-3">
            <span>{article.author.name}</span>
            <span>&middot;</span>
            <time>
              {article.publishedAt?.toLocaleDateString("id-ID", {
                dateStyle: "long",
              })}
            </time>
          </div>

          {/* Desktop cover image */}
          {article.coverImage && (
            <div className="relative mt-8 hidden aspect-video overflow-hidden rounded-lg md:block">
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-sm mt-6 max-w-none overflow-hidden break-words dark:prose-invert md:prose-lg md:mt-8 [&_iframe]:max-w-full [&_img]:max-w-full [&_img]:h-auto [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_video]:max-w-full"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
          />

          {article.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5 md:mt-8 md:gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-6 border-t pt-6 md:mt-8">
            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id"}/blog/${slug}`}
              title={article.title}
            />
          </div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="mb-4 text-base font-semibold">Artikel Terkait</h3>
              <div className="space-y-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted active:bg-muted"
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
                      <p className="line-clamp-2 text-sm font-medium leading-tight">
                        {related.title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {related.publishedAt
                          ? new Date(related.publishedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
