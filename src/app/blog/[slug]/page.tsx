import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ShareButtons } from "@/shared/components/shared/share-buttons";
import { sanitizeHtml } from "@/shared/lib/sanitize";

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
        <div className="relative mt-8 aspect-video overflow-hidden rounded-lg">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-lg mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
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

      <div className="mt-8 border-t pt-6">
        <ShareButtons
          url={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id"}/blog/${slug}`}
          title={article.title}
        />
      </div>
    </article>
    </>
  );
}
