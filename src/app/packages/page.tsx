import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/shared/lib/prisma";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Button } from "@/shared/components/ui/button";
import { FileText, Users, Package } from "lucide-react";
import { PackageCard } from "@/shared/components/packages/package-card";
import { PackagesFilterBar } from "@/shared/components/packages/packages-filter-bar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paket Try Out — Toutopia",
  description:
    "Jelajahi semua paket try out UTBK, CPNS, BUMN, Kedinasan, dan PPPK. Latihan soal berkualitas dengan pembahasan lengkap.",
  openGraph: {
    title: "Paket Try Out — Toutopia",
    description:
      "Jelajahi semua paket try out UTBK, CPNS, BUMN, Kedinasan, dan PPPK.",
  },
};

interface SearchParams {
  category?: string;
  q?: string;
  sort?: string;
}

function buildOrderBy(sort: string): Record<string, unknown>[] {
  switch (sort) {
    case "populer":
      return [{ attempts: { _count: "desc" } }];
    case "harga-asc":
      return [{ price: "asc" }];
    case "harga-desc":
      return [{ price: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const activeCategory = params.category ?? "";
  const query = params.q ?? "";
  const sort = params.sort ?? "";

  const isFiltered = activeCategory !== "" || query !== "" || sort !== "";

  const [categories, packages, aggregateStats] = await Promise.all([
    prisma.examCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.examPackage.findMany({
      where: {
        status: "PUBLISHED",
        ...(activeCategory ? { category: { slug: activeCategory } } : {}),
        ...(query
          ? { title: { contains: query, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: buildOrderBy(sort),
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { attempts: true } },
      },
    }),
    prisma.examPackage.aggregate({
      where: { status: "PUBLISHED" },
      _count: true,
      _sum: { totalQuestions: true },
    }),
  ]);

  const totalParticipants = await prisma.examAttempt.count();

  const freePackages = packages.filter((p) => p.isFree);
  const premiumPackages = packages.filter((p) => !p.isFree);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-16 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Paket Try Out
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Pilih paket latihan sesuai kebutuhanmu. Soal berkualitas,
              pembahasan lengkap, dan analitik performa untuk semua jenis ujian.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Package className="size-4" strokeWidth={1.5} />
                {aggregateStats._count} paket
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="size-4" strokeWidth={1.5} />
                {(aggregateStats._sum.totalQuestions ?? 0).toLocaleString("id-ID")} soal
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" strokeWidth={1.5} />
                {totalParticipants.toLocaleString("id-ID")} peserta
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar + Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <Suspense>
            <PackagesFilterBar
              categories={categories}
              currentQ={query}
              currentCategory={activeCategory}
              currentSort={sort}
            />
          </Suspense>

          <p className="mt-6 mb-4 text-sm text-muted-foreground">
            Menampilkan {packages.length} paket
          </p>

          {packages.length > 0 ? (
            isFiltered ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    slug={pkg.slug}
                    title={pkg.title}
                    description={pkg.description}
                    price={pkg.price}
                    discountPrice={pkg.discountPrice}
                    isFree={pkg.isFree}
                    totalQuestions={pkg.totalQuestions}
                    durationMinutes={pkg.durationMinutes}
                    participantCount={pkg._count.attempts}
                    categoryName={pkg.category.name}
                    categorySlug={pkg.category.slug}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {freePackages.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-6 w-1 rounded-full bg-emerald-500" />
                      <h2 className="text-xl font-semibold tracking-tight">
                        Paket Gratis
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {freePackages.length}
                      </span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {freePackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          slug={pkg.slug}
                          title={pkg.title}
                          description={pkg.description}
                          price={pkg.price}
                          discountPrice={pkg.discountPrice}
                          isFree={pkg.isFree}
                          totalQuestions={pkg.totalQuestions}
                          durationMinutes={pkg.durationMinutes}
                          participantCount={pkg._count.attempts}
                          categoryName={pkg.category.name}
                          categorySlug={pkg.category.slug}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {premiumPackages.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-6 w-1 rounded-full bg-primary" />
                      <h2 className="text-xl font-semibold tracking-tight">
                        Paket Premium
                      </h2>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {premiumPackages.length}
                      </span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {premiumPackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          slug={pkg.slug}
                          title={pkg.title}
                          description={pkg.description}
                          price={pkg.price}
                          discountPrice={pkg.discountPrice}
                          isFree={pkg.isFree}
                          totalQuestions={pkg.totalQuestions}
                          durationMinutes={pkg.durationMinutes}
                          participantCount={pkg._count.attempts}
                          categoryName={pkg.category.name}
                          categorySlug={pkg.category.slug}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <Package className="mx-auto size-10 text-muted-foreground/50" strokeWidth={1.5} />
              <p className="mt-3 text-muted-foreground">
                {isFiltered
                  ? "Tidak ada paket yang cocok dengan filter."
                  : "Belum ada paket try out yang tersedia."}
              </p>
              {isFiltered && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/packages">Lihat Semua Paket</Link>
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Siap Mulai Latihan?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Daftar gratis dan dapatkan 2 kredit try out. Atau lihat paket
              harga untuk akses lebih banyak.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/register">Daftar Gratis</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">Lihat Harga</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
