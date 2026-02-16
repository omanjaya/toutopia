import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { siteConfig } from "@/config/site.config";

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
    take: 6,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      discountPrice: true,
      isFree: true,
      durationMinutes: true,
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
      <div className="mx-auto max-w-5xl px-4 py-12">
        <section className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">{badge}</Badge>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard/tryout">
                Mulai Try Out
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">Lihat Harga</Link>
            </Button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Fitur Unggulan
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-lg border p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        {packages.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-center mb-8">
              Paket Try Out Tersedia
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{pkg.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pkg.durationMinutes} menit &middot; {pkg._count.attempts} peserta
                    </p>
                    <p className="mt-3 text-lg font-bold">
                      {pkg.isFree
                        ? "Gratis"
                        : formatCurrency(pkg.discountPrice ?? pkg.price)}
                    </p>
                    <Button className="mt-4 w-full" variant="outline" asChild>
                      <Link href={`/dashboard/tryout/${pkg.id}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
