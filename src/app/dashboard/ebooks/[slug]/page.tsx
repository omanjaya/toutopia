import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  CalendarDays,
  BookOpen,
  User,
  Tag,
  Clock,
} from "lucide-react";
import { auth } from "@/shared/lib/auth";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { DownloadButton } from "@/shared/components/ebook/download-button";
import { BookCover } from "@/shared/components/ebook/book-cover";
import { ReadingProgress } from "@/shared/components/ebook/reading-progress";
import { estimateFromHtml, estimateFromPages } from "@/shared/lib/reading-time";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEbook(slug: string) {
  const ebook = await prisma.ebook.findUnique({
    where: { slug },
    include: { author: { select: { name: true, avatar: true } } },
  });
  if (!ebook || ebook.status !== "PUBLISHED") return null;
  return ebook;
}


export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ebook = await getEbook(slug);
  if (!ebook) return { title: "Ebook Tidak Ditemukan" };
  return {
    title: `${ebook.title} - Toutopia`,
    description: ebook.description ?? `Baca ebook ${ebook.title} di Toutopia`,
    openGraph: {
      title: ebook.title,
      description: ebook.description ?? `Baca ebook ${ebook.title} di Toutopia`,
      type: "article",
      publishedTime: ebook.publishedAt?.toISOString(),
      authors: ebook.author.name ? [ebook.author.name] : undefined,
      ...(ebook.coverImage ? { images: [ebook.coverImage] } : {}),
    },
  };
}

export default async function EbookDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const ebook = await getEbook(slug);
  if (!ebook) notFound();

  const readingTime =
    ebook.contentType === "HTML"
      ? estimateFromHtml(ebook.htmlContent)
      : estimateFromPages(ebook.pageCount);

  return (
    <>
      {/* Thin reading progress bar — fixed at very top */}
      <ReadingProgress />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/dashboard/ebooks">
            <ArrowLeft className="h-4 w-4" />
            Perpustakaan Ebook
          </Link>
        </Button>

        {/* ── Hero ── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Book Cover — with 3D effect */}
          <div className="mx-auto w-44 shrink-0 lg:mx-0 lg:w-52">
            <BookCover
              src={ebook.coverImage}
              alt={ebook.title}
              width={208}
              priority
            />
          </div>

          {/* Metadata */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {ebook.contentType}
              </Badge>
              {ebook.category && (
                <Badge variant="outline" className="font-normal">
                  {ebook.category}
                </Badge>
              )}
              {ebook.isFree ? (
                <Badge className="bg-emerald-500 hover:bg-emerald-500/90 text-white shadow-sm">
                  Gratis
                </Badge>
              ) : (
                <Badge className="bg-amber-500 hover:bg-amber-500/90 text-white shadow-sm">
                  Premium
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight lg:text-3xl">
              {ebook.title}
            </h1>

            {/* Description */}
            {ebook.description && (
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {ebook.description}
              </p>
            )}

            {/* Meta info */}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
              {ebook.author.name && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>{ebook.author.name}</span>
                </div>
              )}
              {ebook.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <time>
                    {ebook.publishedAt.toLocaleDateString("id-ID", {
                      dateStyle: "long",
                    })}
                  </time>
                </div>
              )}
              {ebook.pageCount && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>{ebook.pageCount} halaman</span>
                </div>
              )}
              {readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{readingTime.label}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {ebook.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground/50" />
                {ebook.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            {ebook.contentType === "PDF" && ebook.pdfUrl && (
              <div className="mt-6">
                <DownloadButton slug={slug} pdfUrl={ebook.pdfUrl} />
              </div>
            )}
          </div>
        </div>

        <Separator className="my-10" />

        {/* ── Content ── */}
        {ebook.contentType === "HTML" && ebook.htmlContent ? (
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
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(ebook.htmlContent) }}
          />
        ) : ebook.contentType === "PDF" && ebook.pdfUrl ? (
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <iframe
              src={ebook.pdfUrl}
              className="h-[85vh] w-full"
              title={ebook.title}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="mt-4 font-medium text-muted-foreground">
              Konten ebook belum tersedia
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Silakan cek kembali nanti
            </p>
          </div>
        )}
      </div>
    </>
  );
}
