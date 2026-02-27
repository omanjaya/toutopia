import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { auth } from "@/shared/lib/auth";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { DownloadButton } from "@/shared/components/ebook/download-button";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEbook(slug: string) {
  const ebook = await prisma.ebook.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, avatar: true } },
    },
  });

  if (!ebook || ebook.status !== "PUBLISHED") return null;

  // Increment view count (fire-and-forget)
  prisma.ebook
    .update({
      where: { id: ebook.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  return ebook;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ebook = await getEbook(slug);

  if (!ebook) return { title: "Ebook Tidak Ditemukan" };

  return {
    title: `${ebook.title}`,
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

export default async function MobileEbookDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const ebook = await getEbook(slug);

  if (!ebook) notFound();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/m/dashboard/ebooks"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="truncate text-base font-semibold">{ebook.title}</h1>
      </div>

      {/* Cover image */}
      {ebook.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={ebook.coverImage}
            alt={ebook.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-5">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{ebook.contentType}</Badge>
          {ebook.category && (
            <Badge variant="outline">{ebook.category}</Badge>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight">{ebook.title}</h2>

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{ebook.author.name}</span>
          <span>&middot;</span>
          <time>
            {ebook.publishedAt?.toLocaleDateString("id-ID", {
              dateStyle: "long",
            })}
          </time>
          {ebook.pageCount && (
            <>
              <span>&middot;</span>
              <span>{ebook.pageCount} halaman</span>
            </>
          )}
        </div>

        {/* Description */}
        {ebook.description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {ebook.description}
          </p>
        )}

        {/* Tags */}
        {ebook.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {ebook.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Ebook content */}
        <div className="mt-6">
          {ebook.contentType === "HTML" && ebook.htmlContent ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert overflow-hidden break-words [&_img]:max-w-full [&_img]:h-auto [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_iframe]:max-w-full [&_video]:max-w-full"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(ebook.htmlContent),
              }}
            />
          ) : ebook.contentType === "PDF" && ebook.pdfUrl ? (
            <div className="space-y-4">
              <iframe
                src={ebook.pdfUrl}
                className="h-[70vh] w-full max-w-full rounded-lg border"
                title={ebook.title}
              />
              <DownloadButton slug={slug} pdfUrl={ebook.pdfUrl} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                Konten ebook belum tersedia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
