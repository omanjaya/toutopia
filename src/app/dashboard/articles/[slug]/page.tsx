import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Tag,
  Clock,
  Eye,
} from "lucide-react";
import { auth } from "@/shared/lib/auth";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { ReadingProgress } from "@/shared/components/ebook/reading-progress";
import { estimateFromHtml } from "@/shared/lib/reading-time";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: { select: { name: true, avatar: true } } },
  });
  if (!article || article.status !== "PUBLISHED") return null;
  return article;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: `${article.title} - Toutopia`,
    description: article.excerpt ?? `Baca artikel ${article.title} di Toutopia`,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? `Baca artikel ${article.title} di Toutopia`,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author.name ? [article.author.name] : undefined,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // Fire-and-forget view count increment
  prisma.article
    .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const readingTime = estimateFromHtml(article.content);

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/dashboard/articles">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Artikel
          </Link>
        </Button>

        {/* Category + tags */}
        <div className="flex flex-wrap items-center gap-2">
          {article.category && (
            <Badge variant="secondary" className="font-normal">
              {article.category}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
          {article.title}
        </h1>

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {article.author.name && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>{article.author.name}</span>
            </div>
          )}
          {article.publishedAt && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <time>
                {article.publishedAt.toLocaleDateString("id-ID", {
                  dateStyle: "long",
                })}
              </time>
            </div>
          )}
          {readingTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{readingTime.label}</span>
            </div>
          )}
          {article.viewCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span>{article.viewCount.toLocaleString("id-ID")} kali dibaca</span>
            </div>
          )}
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground border-l-4 border-primary/30 pl-4">
            {article.excerpt}
          </p>
        )}

        {/* Cover image */}
        {article.coverImage && (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl shadow-md">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <Separator className="my-8" />

        {/* Article body */}
        <div
          className="
            prose prose-neutral max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            prose-p:leading-[1.85] prose-p:text-[17px]
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
            prose-pre:rounded-xl prose-pre:border prose-pre:bg-muted
            prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:text-sm
            prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary/50
            prose-blockquote:bg-primary/5 prose-blockquote:py-0.5 prose-blockquote:rounded-r-lg
            prose-blockquote:text-muted-foreground
            prose-li:leading-relaxed
            prose-strong:text-foreground
          "
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <>
            <Separator className="mt-10 mb-5" />
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground/50" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Back link at bottom */}
        <div className="mt-12">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/articles">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Lihat Artikel Lainnya
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
