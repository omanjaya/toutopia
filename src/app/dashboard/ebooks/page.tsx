import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { auth } from "@/shared/lib/auth";
import { BookText, Eye } from "lucide-react";
import { EbookFilters } from "./ebook-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ebook - Toutopia",
  description:
    "Koleksi ebook dan materi belajar untuk persiapan UTBK, CPNS, BUMN, dan lainnya.",
  openGraph: {
    title: "Ebook - Toutopia",
    description:
      "Koleksi ebook dan materi belajar untuk persiapan ujian.",
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ebook</h1>
        <p className="mt-2 text-muted-foreground">
          Koleksi materi belajar dan referensi untuk persiapan ujianmu
        </p>
      </div>

      <EbookFilters categories={categories} currentCategory={category} currentQuery={q} />

      {ebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookText className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">
            {q || category ? "Tidak ada ebook yang sesuai filter" : "Belum ada ebook tersedia"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ebooks.map((ebook) => (
            <Link key={ebook.id} href={`/dashboard/ebooks/${ebook.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {ebook.coverImage ? (
                    <Image
                      src={ebook.coverImage}
                      alt={ebook.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookText className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">
                      {ebook.contentType}
                    </Badge>
                    {ebook.category && (
                      <Badge variant="outline">
                        {ebook.category}
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-semibold leading-tight line-clamp-2">
                    {ebook.title}
                  </h2>
                  {ebook.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {ebook.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{ebook.author.name}</span>
                    {ebook.pageCount && (
                      <>
                        <span>&middot;</span>
                        <span>{ebook.pageCount} halaman</span>
                      </>
                    )}
                    {ebook.viewCount > 0 && (
                      <>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {ebook.viewCount}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {ebook.publishedAt
                      ? new Date(ebook.publishedAt).toLocaleDateString(
                          "id-ID",
                          { dateStyle: "medium" }
                        )
                      : ""}
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
