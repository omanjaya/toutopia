import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Clock, FileText, Users, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

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

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const activeCategory = params.category ?? null;

  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  const packages = await prisma.examPackage.findMany({
    where: {
      status: "PUBLISHED",
      ...(activeCategory
        ? { category: { slug: activeCategory } }
        : {}),
    },
    orderBy: [{ isFree: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { name: true, slug: true } },
      sections: {
        orderBy: { order: "asc" },
        select: { title: true, totalQuestions: true, durationMinutes: true },
      },
      _count: { select: { attempts: true } },
    },
  });

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

            {/* Category Filter */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link href="/packages" scroll={false}>
                <Badge
                  variant={activeCategory === null ? "default" : "outline"}
                  className="cursor-pointer px-4 py-1.5 text-sm"
                >
                  Semua
                </Badge>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/packages?category=${cat.slug}`}
                  scroll={false}
                >
                  <Badge
                    variant={
                      activeCategory === cat.slug ? "default" : "outline"
                    }
                    className="cursor-pointer px-4 py-1.5 text-sm"
                  >
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Package Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          {packages.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{pkg.category.name}</Badge>
                      {pkg.isFree ? (
                        <Badge variant="secondary">Gratis</Badge>
                      ) : (
                        <span className="text-sm font-semibold">
                          {pkg.discountPrice !== null ? (
                            <>
                              <span className="text-muted-foreground line-through mr-1.5">
                                {formatCurrency(pkg.price)}
                              </span>
                              {formatCurrency(pkg.discountPrice)}
                            </>
                          ) : (
                            formatCurrency(pkg.price)
                          )}
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-2">{pkg.title}</CardTitle>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="size-4" strokeWidth={1.5} />
                        {pkg.totalQuestions} soal
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" strokeWidth={1.5} />
                        {pkg.durationMinutes} menit
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-4" strokeWidth={1.5} />
                        {pkg._count.attempts} peserta
                      </span>
                    </div>

                    {pkg.sections.length > 0 && (
                      <div className="space-y-1">
                        {pkg.sections.map((s, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {s.title} ({s.totalQuestions} soal, {s.durationMinutes}
                            m)
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button asChild className="w-full">
                        <Link href={`/packages/${pkg.slug}`}>
                          Lihat Detail
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border p-12 text-center">
              <p className="text-muted-foreground">
                {activeCategory
                  ? "Belum ada paket try out untuk kategori ini."
                  : "Belum ada paket try out yang tersedia."}
              </p>
              {activeCategory && (
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
