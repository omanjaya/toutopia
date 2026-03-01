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
  Pencil,
  AlertTriangle,
} from "lucide-react";
import { auth } from "@/shared/lib/auth";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { ReadingProgress } from "@/shared/components/ebook/reading-progress";
import { estimateFromHtml } from "@/shared/lib/reading-time";
import type { SessionUser } from "@/shared/types/user.types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: { author: { select: { name: true, avatar: true } } },
  });
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return { title: `[Preview] ${article.title}` };
}

const STATUS_CONFIG = {
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    barClassName: "",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    barClassName: "border-b border-yellow-200 bg-yellow-50 text-yellow-800",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
    barClassName: "border-b border-gray-200 bg-gray-50 text-gray-700",
  },
} as const;

export default async function AdminArticlePreviewPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const statusCfg =
    STATUS_CONFIG[article.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.DRAFT;
  const isNotPublished = article.status !== "PUBLISHED";
  const readingTime = estimateFromHtml(article.content);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Reading progress */}
      <ReadingProgress />

      {/* Admin top bar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              asChild
            >
              <Link href="/admin/articles">
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mode Preview Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${statusCfg.className}`}>
              {statusCfg.label}
            </Badge>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
              <Link href={`/admin/articles/${article.id}`}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit Artikel</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Non-published warning */}
      {isNotPublished && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2 text-xs ${statusCfg.barClassName}`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Artikel ini berstatus <strong>{statusCfg.label}</strong> — tidak
            terlihat oleh pengguna
          </span>
        </div>
      )}

      {/* Content — mirrors /dashboard/articles/[slug] exactly */}
      <main className="flex-1 p-6 lg:p-8">
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

          {/* Category */}
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
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <time>
                {(article.publishedAt ?? article.createdAt).toLocaleDateString(
                  "id-ID",
                  { dateStyle: "long" }
                )}
              </time>
            </div>
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

          {/* Excerpt as lead */}
          {article.excerpt && (
            <p className="mt-5 border-l-4 border-primary/30 pl-4 text-lg leading-relaxed text-muted-foreground">
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

          {/* Body */}
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

          <div className="mt-12">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/articles">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Lihat Artikel Lainnya
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
