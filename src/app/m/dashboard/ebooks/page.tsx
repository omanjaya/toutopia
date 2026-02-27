import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { BookText, Eye } from "lucide-react";
import { MobileEbookFilters } from "./ebook-filters-mobile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ebook",
  description:
    "Koleksi ebook dan materi belajar untuk persiapan UTBK, CPNS, BUMN, dan lainnya.",
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
              {
                description: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
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

export default async function MobileEbooksPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const [ebooks, categories] = await Promise.all([
    getEbooks(category, q),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Ebook</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Koleksi materi belajar dan referensi ujian
        </p>
      </div>

      {/* Filters */}
      <MobileEbookFilters
        categories={categories}
        currentCategory={category}
        currentQuery={q}
      />

      {/* Ebook Grid */}
      {ebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold">Tidak ada ebook</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {q || category
              ? "Tidak ada ebook yang sesuai filter. Coba kata kunci lain."
              : "Belum ada ebook tersedia saat ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {ebooks.map((ebook) => (
            <Link
              key={ebook.id}
              href={`/m/dashboard/ebooks/${ebook.slug}`}
            >
              <Card className="h-full overflow-hidden active:scale-[0.98] transition-transform">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {ebook.coverImage ? (
                    <Image
                      src={ebook.coverImage}
                      alt={ebook.title}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookText className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {ebook.contentType}
                    </Badge>
                    {ebook.category && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {ebook.category}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-sm font-semibold leading-tight line-clamp-2">
                    {ebook.title}
                  </h2>
                  {ebook.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {ebook.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                    <span>{ebook.author.name}</span>
                    {ebook.pageCount && (
                      <>
                        <span>&middot;</span>
                        <span>{ebook.pageCount} hal</span>
                      </>
                    )}
                    {ebook.viewCount > 0 && (
                      <>
                        <span>&middot;</span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" />
                          {ebook.viewCount}
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
