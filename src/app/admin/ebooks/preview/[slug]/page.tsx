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
  FileText,
  Eye,
  Pencil,
  AlertTriangle,
  BookOpen,
  User,
  CalendarDays,
  Tag,
  Clock,
} from "lucide-react";
import { auth } from "@/shared/lib/auth";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { DownloadButton } from "@/shared/components/ebook/download-button";
import { BookCover } from "@/shared/components/ebook/book-cover";
import { ReadingProgress } from "@/shared/components/ebook/reading-progress";
import { estimateFromHtml, estimateFromPages } from "@/shared/lib/reading-time";
import type { SessionUser } from "@/shared/types/user.types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEbook(slug: string) {
  return prisma.ebook.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, avatar: true } },
    },
  });
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ebook = await getEbook(slug);
  if (!ebook) return { title: "Ebook Tidak Ditemukan" };
  return { title: `[Preview] ${ebook.title}` };
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

export default async function AdminEbookPreviewPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { slug } = await params;
  const ebook = await getEbook(slug);
  if (!ebook) notFound();

  const statusCfg =
    STATUS_CONFIG[ebook.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.DRAFT;
  const isNotPublished = ebook.status !== "PUBLISHED";

  const readingTime =
    ebook.contentType === "HTML"
      ? estimateFromHtml(ebook.htmlContent)
      : estimateFromPages(ebook.pageCount);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Admin top bar ── */}
      <div className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              asChild
            >
              <Link href="/admin/ebooks">
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
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              asChild
            >
              <Link href={`/admin/ebooks/${ebook.id}`}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit Ebook</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Non-published warning ── */}
      {isNotPublished && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2 text-xs ${statusCfg.barClassName}`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Ebook ini berstatus{" "}
            <strong>{statusCfg.label}</strong> — tidak terlihat oleh pengguna
          </span>
        </div>
      )}

      {/* Reading progress bar */}
      <ReadingProgress />

      {/* ── Content — mirrors student /dashboard/ebooks/[slug] exactly ── */}
      <main className="flex-1 p-6 lg:p-8">
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

          {/* Hero — two-column */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Book Cover with 3D effect */}
            <div className="mx-auto w-44 shrink-0 lg:mx-0 lg:w-52">
              <BookCover
                src={ebook.coverImage}
                alt={ebook.title}
                width={208}
                priority
              />
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
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

              <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight lg:text-3xl">
                {ebook.title}
              </h1>

              {ebook.description && (
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {ebook.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
                {ebook.author.name && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>{ebook.author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <time>
                    {(ebook.publishedAt ?? ebook.createdAt).toLocaleDateString(
                      "id-ID",
                      { dateStyle: "long" }
                    )}
                  </time>
                </div>
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

              {ebook.contentType === "PDF" && ebook.pdfUrl && (
                <div className="mt-6">
                  <DownloadButton slug={slug} pdfUrl={ebook.pdfUrl} />
                </div>
              )}
            </div>
          </div>

          <Separator className="my-10" />

          {/* Content */}
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
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(ebook.htmlContent),
              }}
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
                Tambahkan konten HTML atau unggah file PDF di halaman edit
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href={`/admin/ebooks/${ebook.id}`}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit Ebook
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
