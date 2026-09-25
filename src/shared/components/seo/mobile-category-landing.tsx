import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText } from "lucide-react";
import { cn, formatCurrency } from "@/shared/lib/utils";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface MobileCategoryLandingProps {
  categorySlug: string;
  badge: string;
  title: string;
  subtitle: string;
  features: string[];
  backHref?: string;
  backLabel?: string;
}

export async function MobileCategoryLanding({
  categorySlug,
  badge,
  title,
  subtitle,
  features,
  backHref = "/m/tryout",
  backLabel = "Tryout",
}: MobileCategoryLandingProps) {
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

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Back nav */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={backHref}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">{backLabel}</h1>
      </div>

      {/* Hero */}
      <div className="mb-6 text-center">
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
          {badge}
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight leading-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button className="rounded-full px-5" asChild>
            <Link href="/m/tryout">
              Mulai Try Out
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full px-5" asChild>
            <Link href="/m/pricing">Lihat Harga</Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-semibold tracking-tight">
          Fitur Unggulan
        </h3>
        <div className="space-y-2">
          {features.map((feature) => (
            <div
              key={feature}
              className={cn(
                cardCls,
                "flex items-start gap-3 px-4 py-3",
              )}
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-sm">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Package list */}
      {packages.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-semibold tracking-tight">
            Paket Try Out Tersedia
          </h3>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className={cardCls}>
                <div className="p-4">
                  <h4 className="text-sm font-semibold leading-snug">
                    {pkg.title}
                  </h4>
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
                    <span className="text-muted-foreground/60">
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
        </div>
      )}

      {packages.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Belum ada paket tersedia untuk kategori ini.
          </p>
          <Button className="mt-4 rounded-full px-5" asChild>
            <Link href="/m/tryout">Lihat Semua Tryout</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
