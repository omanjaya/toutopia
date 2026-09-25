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
import { MobilePackageCard } from "@/shared/components/packages/mobile-package-card";
import { MobileCategoryPills } from "@/shared/components/packages/mobile-category-pills";

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
        {/* Hero — desktop */}
        <section className="relative hidden py-20 sm:block">
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

        {/* Mobile header + stats strip */}
        <div className="sm:hidden px-4 pb-5 pt-6">
          <h1 className="text-xl font-semibold tracking-tight">Paket Try Out</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih paket latihan sesuai kebutuhanmu
          </p>
          <div className="mt-4 grid grid-cols-3 divide-x rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-bold">{aggregateStats._count}</span>
              <span className="text-[10px] text-muted-foreground">paket</span>
            </div>
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-bold">
                {(aggregateStats._sum.totalQuestions ?? 0).toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] text-muted-foreground">soal</span>
            </div>
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-bold">
                {totalParticipants.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] text-muted-foreground">peserta</span>
            </div>
          </div>
        </div>

        {/* Mobile category + sort pills */}
        <div className="sm:hidden">
          <MobileCategoryPills
            categories={categories}
            activeCategory={activeCategory}
            sort={sort}
          />
        </div>

        {/* Desktop Filter Bar + Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="hidden sm:block">
            <Suspense>
              <PackagesFilterBar
                categories={categories}
                currentQ={query}
                currentCategory={activeCategory}
                currentSort={sort}
              />
            </Suspense>
          </div>

          <p className="mt-4 mb-4 text-xs text-muted-foreground sm:mt-6 sm:text-sm">
            Menampilkan {packages.length} paket
          </p>

          {packages.length > 0 ? (
            isFiltered ? (
              <>
                {/* Mobile: list */}
                <div className="space-y-3 sm:hidden">
                  {packages.map((pkg) => (
                    <MobilePackageCard
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
                {/* Desktop: grid */}
                <div className="hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              </>
            ) : (
              <div className="space-y-8 sm:space-y-12">
                {freePackages.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                      <div className="h-5 w-1 rounded-full bg-emerald-500 sm:h-6" />
                      <h2 className="text-base font-semibold tracking-tight sm:text-xl">
                        Paket Gratis
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 sm:px-2.5">
                        {freePackages.length}
                      </span>
                    </div>
                    {/* Mobile: list */}
                    <div className="space-y-3 sm:hidden">
                      {freePackages.map((pkg) => (
                        <MobilePackageCard
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
                    {/* Desktop: grid */}
                    <div className="hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                      <div className="h-5 w-1 rounded-full bg-primary sm:h-6" />
                      <h2 className="text-base font-semibold tracking-tight sm:text-xl">
                        Paket Premium
                      </h2>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary sm:px-2.5">
                        {premiumPackages.length}
                      </span>
                    </div>
                    {/* Mobile: list */}
                    <div className="space-y-3 sm:hidden">
                      {premiumPackages.map((pkg) => (
                        <MobilePackageCard
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
                    {/* Desktop: grid */}
                    <div className="hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="rounded-xl border border-dashed p-10 text-center sm:p-12">
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
        <section className="border-t bg-muted/30 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              Siap Mulai Latihan?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Daftar gratis dan dapatkan 2 kredit try out. Atau lihat paket
              harga untuk akses lebih banyak.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">Daftar Gratis</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
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
