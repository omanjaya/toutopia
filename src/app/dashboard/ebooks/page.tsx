import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { auth } from "@/shared/lib/auth";
import { BookText, Eye, BookOpen } from "lucide-react";
import { EbookFilters } from "./ebook-filters";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ebook - Toutopia",
  description:
    "Koleksi ebook dan materi belajar untuk persiapan UTBK, CPNS, BUMN, dan lainnya.",
  openGraph: {
    title: "Ebook - Toutopia",
    description: "Koleksi materi belajar dan referensi untuk persiapan ujianmu.",
  },
};

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

async function getEbooks(category?: string, query?: string) {
  return prisma.ebook.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { description: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      contentType: true,
      category: true,
      pageCount: true,
      viewCount: true,
      isFree: true,
      price: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

async function getCategories(): Promise<string[]> {
  const results = await prisma.ebook.findMany({
    where: { status: "PUBLISHED", category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });
  return results.map((r) => r.category).filter(Boolean) as string[];
}

export default async function EbooksPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { category, q } = await searchParams;
  const [ebooks, categories] = await Promise.all([
    getEbooks(category, q),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perpustakaan Ebook</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ebooks.length > 0
              ? `${ebooks.length} materi tersedia untuk persiapan ujianmu`
              : "Koleksi materi belajar dan referensi"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Filters */}
      <EbookFilters
        categories={categories}
        currentCategory={category}
        currentQuery={q}
      />

      {/* Grid */}
      {ebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <BookText className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="mt-4 font-medium text-muted-foreground">
            {q || category ? "Tidak ada ebook yang sesuai" : "Belum ada ebook tersedia"}
          </p>
          {(q || category) && (
            <p className="mt-1 text-sm text-muted-foreground/70">
              Coba hapus filter atau ubah kata kunci pencarian
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ebooks.map((ebook) => (
            <Link key={ebook.id} href={`/dashboard/ebooks/${ebook.slug}`} className="group">
              <div className={`${cardCls} h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_8px_24px_rgba(0,0,0,0.18)]`}>
                {/* Book cover — portrait ratio */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/60">
                  {/* Book spine left edge */}
                  <div className="absolute inset-y-0 left-0 z-10 w-2.5 bg-gradient-to-r from-black/20 to-transparent" />

                  {ebook.coverImage ? (
                    <Image
                      src={ebook.coverImage}
                      alt={ebook.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
                      <BookText className="h-12 w-12 text-muted-foreground/25" />
                      <p className="text-center text-xs font-medium leading-snug text-muted-foreground/60 line-clamp-3">
                        {ebook.title}
                      </p>
                    </div>
                  )}

                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Free / Paid badge */}
                  <div className="absolute left-2 top-2">
                    {ebook.isFree ? (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        Gratis
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* View count */}
                  {ebook.viewCount > 0 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                      <Eye className="h-2.5 w-2.5" />
                      {ebook.viewCount.toLocaleString("id-ID")}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-3">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {ebook.title}
                  </h2>

                  {ebook.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {ebook.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {ebook.category && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                          {ebook.category}
                        </Badge>
                      )}
                      {ebook.pageCount && (
                        <span>{ebook.pageCount} hal</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground/60">
                      {ebook.contentType}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
