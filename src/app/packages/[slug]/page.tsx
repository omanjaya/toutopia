import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Button } from "@/shared/components/ui/button";
import {
  Clock,
  FileText,
  Shield,
  Users,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Trophy,
  CheckCircle2,
  BarChart3,
  Timer,
  ChevronRight,
  Zap,
} from "lucide-react";
import { formatCurrency, cn } from "@/shared/lib/utils";
import { getCategoryTheme } from "@/shared/lib/category-colors";
import { CategoryBadge } from "@/shared/components/packages/category-badge";
import { PriceDisplay } from "@/shared/components/packages/price-display";
import { RelatedPackages } from "@/shared/components/packages/related-packages";

export const dynamic = "force-dynamic";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPackage(slug: string) {
  return prisma.examPackage.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          subject: { select: { name: true } },
        },
      },
      _count: { select: { attempts: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) {
    return { title: "Paket Tidak Ditemukan" };
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";
  const canonicalUrl = `${BASE_URL}/packages/${slug}`;
  const description =
    pkg.description ??
    `Try out ${pkg.category.name} dengan ${pkg.totalQuestions} soal, ${pkg.durationMinutes} menit. Latihan berkualitas di Toutopia.`;

  return {
    title: pkg.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${pkg.title} — Toutopia`,
      description,
      url: canonicalUrl,
      images: [
        { url: "/images/og.png", width: 1200, height: 630, alt: pkg.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pkg.title,
      description,
    },
  };
}

export default async function PackageDetailPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) notFound();

  const session = await auth();
  const isLoggedIn = !!session?.user;

  const theme = getCategoryTheme(pkg.category.slug);

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: pkg.title,
    description:
      pkg.description ??
      `Try out ${pkg.category.name} dengan ${pkg.totalQuestions} soal, ${pkg.durationMinutes} menit.`,
    url: `${BASE_URL}/packages/${slug}`,
    provider: {
      "@type": "Organization",
      name: "Toutopia",
      url: BASE_URL,
    },
    educationalLevel: pkg.category.name,
    numberOfCredits: pkg.totalQuestions,
    timeRequired: `PT${pkg.durationMinutes}M`,
    ...(pkg.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: pkg.discountPrice ?? pkg.price,
            priceCurrency: "IDR",
            availability: "https://schema.org/InStock",
          },
        }
      : { isAccessibleForFree: true }),
  };

  const stats = [
    {
      icon: FileText,
      label: "Soal",
      value: pkg.totalQuestions.toString(),
    },
    {
      icon: Clock,
      label: "Menit",
      value: pkg.durationMinutes.toString(),
    },
    {
      icon: RotateCcw,
      label: "Percobaan",
      value: `${pkg.maxAttempts}x`,
    },
    {
      icon: Users,
      label: "Peserta",
      value: pkg._count.attempts.toLocaleString("id-ID"),
    },
  ];

  const features = [
    { label: "Pembahasan lengkap setiap soal", included: true },
    { label: "Analitik performa per topik", included: true },
    { label: "Timer ujian realistis", included: true },
    ...(pkg.isAntiCheat
      ? [{ label: "Mode anti-cheat aktif", included: true }]
      : []),
    ...(pkg.isCatMode
      ? [{ label: "Computer Adaptive Testing (CAT)", included: true }]
      : []),
    { label: `Maksimal ${pkg.maxAttempts}x percobaan`, included: true },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/packages" className="transition-colors hover:text-foreground">
            Paket Try Out
          </Link>
          <ChevronRight className="size-3.5" />
          <Link
            href={`/packages?category=${pkg.category.slug}`}
            className={cn("transition-colors hover:text-foreground", theme.text)}
          >
            {pkg.category.name}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate text-foreground font-medium">{pkg.title}</span>
        </nav>

        <div className="space-y-8">
          {/* Category-tinted Hero */}
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl bg-gradient-to-br via-transparent to-transparent p-6 sm:p-8",
              theme.gradientFrom,
            )}
          >
            <div
              className={cn(
                "absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl",
                theme.bg,
              )}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <CategoryBadge
                  name={pkg.category.name}
                  slug={pkg.category.slug}
                />
                {pkg.isFree && (
                  <span className="rounded-full bg-emerald-500 px-3 py-0.5 text-sm font-medium text-white">
                    Gratis
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {pkg.title}
              </h1>
              {pkg.description && (
                <p className="mt-2 text-muted-foreground max-w-xl">
                  {pkg.description}
                </p>
              )}
            </div>
          </div>

          {/* Combined Stats + Price + CTA Card */}
          <div className={cardCls}>
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 border-b p-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className={cn(
                      "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl",
                      theme.bg,
                    )}
                  >
                    <stat.icon className={cn("h-5 w-5", theme.text)} />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    theme.bg,
                  )}
                >
                  <Trophy className={cn("h-6 w-6", theme.text)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Harga</p>
                  <PriceDisplay
                    price={pkg.price}
                    discountPrice={pkg.discountPrice}
                    isFree={pkg.isFree}
                    size="lg"
                  />
                </div>
              </div>

              {isLoggedIn ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={`/dashboard/tryout/${pkg.id}`}>
                    Mulai Try Out
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              ) : (
                <div className="flex w-full gap-3 sm:w-auto">
                  <Button asChild size="lg" className="flex-1 sm:flex-none">
                    <Link href="/login">
                      Masuk
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="flex-1 sm:flex-none"
                  >
                    <Link href="/register">Daftar Gratis</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Features Checklist */}
          <div className={cardCls}>
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                Fitur Termasuk
              </h3>
            </div>
            <div className="px-6 pb-6">
              <div className="grid gap-2 sm:grid-cols-2">
                {features.map((feat) => (
                  <div
                    key={feat.label}
                    className="flex items-center gap-2.5 rounded-lg p-2"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    <span className="text-sm">{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sections / Exam Structure */}
          {pkg.sections.length > 0 && (
            <div className={cardCls}>
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  Struktur Ujian
                </h3>
              </div>
              <div className="px-6 pb-6 space-y-2">
                {pkg.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/30",
                      `border-l-4`,
                      theme.borderAccent,
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                          theme.bg,
                          theme.text,
                        )}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {section.subject.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {section.totalQuestions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {section.durationMinutes}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Packages */}
          <Suspense>
            <RelatedPackages
              categoryId={pkg.category.id}
              currentPackageId={pkg.id}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
