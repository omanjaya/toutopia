import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, FileText, Users } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { siteConfig } from "@/config/site.config";

const cardCls = "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface CategoryLandingProps {
  categorySlug: string;
  badge: string;
  title: string;
  subtitle: string;
  features: string[];
  educationalLevel?: string;
}

export async function CategoryLanding({
  categorySlug,
  badge,
  title,
  subtitle,
  features,
  educationalLevel = "Umum",
}: CategoryLandingProps) {
  const packages = await prisma.examPackage.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      discountPrice: true,
      isFree: true,
      durationMinutes: true,
      totalQuestions: true,
      _count: { select: { attempts: true } },
    },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description: subtitle,
    provider: {
      "@type": "Organization",
      name: "Toutopia",
      url: siteConfig.url,
    },
    educationalLevel,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Hero */}
        <section className="mb-10 text-center sm:mb-16">
          <Badge className="mb-3 bg-muted text-foreground sm:mb-4">{badge}</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard/tryout">
                Mulai Try Out
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/pricing">Lihat Harga</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mb-10 sm:mb-16">
          <h2 className="mb-4 text-xl font-bold sm:mb-8 sm:text-center sm:text-2xl">
            Fitur Unggulan
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-lg border p-3 sm:p-4"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
                <p className="text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Package list */}
        {packages.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold sm:mb-8 sm:text-center sm:text-2xl">
              Paket Try Out Tersedia
            </h2>
            {/* Mobile: stacked list with compact info */}
            <div className="space-y-3 sm:hidden">
              {packages.map((pkg) => (
                <div key={pkg.id} className={cardCls}>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold leading-snug">
                      {pkg.title}
                    </h3>
                    {pkg.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {pkg.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {pkg.durationMinutes} menit
                      </span>
                      {pkg.totalQuestions > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {pkg.totalQuestions} soal
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {pkg._count.attempts} peserta
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {pkg.isFree ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          GRATIS
                        </Badge>
                      ) : (
                        <span className="text-sm font-semibold">
                          {formatCurrency(pkg.discountPrice ?? pkg.price)}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full px-4 text-xs"
                        asChild
                      >
                        <Link href={`/packages/${pkg.slug}`}>Lihat Detail</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: grid with card style */}
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className={cardCls}>
                  <div className="p-6">
                    <h3 className="font-semibold">{pkg.title}</h3>
                    {pkg.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {pkg.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pkg.durationMinutes} menit &middot; {pkg._count.attempts} peserta
                    </p>
                    <p className="mt-3 text-lg font-bold">
                      {pkg.isFree
                        ? "Gratis"
                        : formatCurrency(pkg.discountPrice ?? pkg.price)}
                    </p>
                    <Button className="mt-4 w-full" variant="outline" asChild>
                      <Link href={`/packages/${pkg.slug}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {packages.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Belum ada paket tersedia untuk kategori ini.
            </p>
            <Button className="mt-4 w-full sm:w-auto" asChild>
              <Link href="/packages">Lihat Semua Paket</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
