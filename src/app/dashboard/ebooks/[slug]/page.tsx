import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/dashboard/ebooks">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Ebook
        </Link>
      </Button>

      <div className="mb-4 flex items-center gap-2">
        <Badge variant="secondary">{ebook.contentType}</Badge>
        {ebook.category && (
          <Badge variant="outline">{ebook.category}</Badge>
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
        {ebook.title}
      </h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
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

      {ebook.description && (
        <p className="mt-4 text-muted-foreground">{ebook.description}</p>
      )}

      {ebook.coverImage && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-lg">
          <img
            src={ebook.coverImage}
            alt={ebook.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Ebook content */}
      <div className="mt-8">
        {ebook.contentType === "HTML" && ebook.htmlContent ? (
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(ebook.htmlContent) }}
          />
        ) : ebook.contentType === "PDF" && ebook.pdfUrl ? (
          <div className="space-y-4">
            <iframe
              src={ebook.pdfUrl}
              className="w-full h-[80vh] rounded-lg border"
              title={ebook.title}
            />
            <DownloadButton slug={slug} pdfUrl={ebook.pdfUrl} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">
              Konten ebook belum tersedia
            </p>
          </div>
        )}
      </div>

      {ebook.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {ebook.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
