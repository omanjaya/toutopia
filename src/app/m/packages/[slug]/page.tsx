import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import {
  ArrowLeft,
  Clock,
  FileText,
  Users,
  RotateCcw,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Zap,
  Trophy,
} from "lucide-react";
import { formatCurrency, cn } from "@/shared/lib/utils";
import { getCategoryTheme } from "@/shared/lib/category-colors";
import { CategoryBadge } from "@/shared/components/packages/category-badge";

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

  const description =
    pkg.description ??
    `Try out ${pkg.category.name} dengan ${pkg.totalQuestions} soal, ${pkg.durationMinutes} menit. Latihan berkualitas di Toutopia.`;

  return {
    title: pkg.title,
    description,
  };
}

export default async function MobilePackageDetailPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) notFound();

  const session = await auth();
  const isLoggedIn = !!session?.user;

  const theme = getCategoryTheme(pkg.category.slug);

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
    { label: "Pembahasan lengkap setiap soal" },
    { label: "Analitik performa per topik" },
    { label: "Timer ujian realistis" },
    ...(pkg.isAntiCheat ? [{ label: "Mode anti-cheat aktif" }] : []),
    ...(pkg.isCatMode
      ? [{ label: "Computer Adaptive Testing (CAT)" }]
      : []),
    { label: `Maksimal ${pkg.maxAttempts}x percobaan` },
  ];

  // Related packages in same category
  const related = await prisma.examPackage.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: pkg.category.id,
      id: { not: pkg.id },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      discountPrice: true,
      isFree: true,
      totalQuestions: true,
      durationMinutes: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="min-h-screen bg-background pb-32 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3 px-4">
        <Link
          href="/m/packages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="line-clamp-1 text-xl font-semibold tracking-tight">
          {pkg.title}
        </h1>
      </div>

      <div className="space-y-4 px-4">
        {/* Category-tinted Hero */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-gradient-to-br via-transparent to-transparent p-5",
            theme.gradientFrom,
          )}
        >
          <div
            className={cn(
              "absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-60",
              theme.bg,
            )}
          />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <CategoryBadge
                name={pkg.category.name}
                slug={pkg.category.slug}
                size="sm"
              />
              {pkg.isFree && (
                <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-medium text-white">
                  Gratis
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold leading-snug tracking-tight">
              {pkg.title}
            </h2>
            {pkg.description && (
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">
                {pkg.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className={cn(cardCls, "grid grid-cols-4")}>
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center py-4",
                idx < stats.length - 1 && "border-r",
              )}
            >
              <div
                className={cn(
                  "mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg",
                  theme.bg,
                )}
              >
                <stat.icon className={cn("h-4 w-4", theme.text)} strokeWidth={1.5} />
              </div>
              <p className="text-base font-bold leading-none">{stat.value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Price Card */}
        <div className={cn(cardCls, "p-4")}>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                theme.bg,
              )}
            >
              <Trophy className={cn("h-5 w-5", theme.text)} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Harga paket</p>
              {pkg.isFree ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-0.5 text-sm font-semibold text-emerald-700">
                  Gratis
                </span>
              ) : pkg.discountPrice !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">
                    {formatCurrency(pkg.discountPrice)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                    -{Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold">
                  {formatCurrency(pkg.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={cardCls}>
          <div className="px-4 pt-4 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              Fitur Termasuk
            </h3>
          </div>
          <div className="space-y-1 px-4 pb-4">
            {features.map((feat) => (
              <div
                key={feat.label}
                className="flex items-center gap-2.5 rounded-lg py-1.5"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-emerald-500"
                  strokeWidth={1.5}
                />
                <span className="text-sm">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Structure */}
        {pkg.sections.length > 0 && (
          <div className={cardCls}>
            <div className="px-4 pt-4 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <BookOpen
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                Struktur Ujian
              </h3>
            </div>
            <div className="space-y-2 px-4 pb-4">
              {pkg.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3",
                    "border-l-4",
                    theme.borderAccent,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        theme.bg,
                        theme.text,
                      )}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">
                        {section.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section.subject.name}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <FileText className="h-3 w-3" strokeWidth={1.5} />
                      {section.totalQuestions}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {section.durationMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Packages */}
        {related.length > 0 && (
          <div>
            <h3 className="mb-3 text-base font-semibold tracking-tight">
              Paket Lainnya
            </h3>
            <div className="space-y-3">
              {related.map((rel) => {
                const relTheme = getCategoryTheme(rel.category.slug);
                return (
                  <Link key={rel.id} href={`/m/packages/${rel.slug}`}>
                    <div
                      className={cn(
                        cardCls,
                        "flex items-center gap-3 p-3 transition-transform active:scale-[0.98]",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          relTheme.bg,
                        )}
                      >
                        <FileText
                          className={cn("h-5 w-5", relTheme.text)}
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {rel.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rel.totalQuestions} soal &middot; {rel.durationMinutes} menit
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {rel.isFree ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Gratis
                          </span>
                        ) : (
                          <span className="text-xs font-semibold">
                            {formatCurrency(rel.discountPrice ?? rel.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 px-4 py-3 backdrop-blur-sm">
        {isLoggedIn ? (
          <Link
            href={`/m/dashboard/payment?package=${pkg.slug}`}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold",
              "bg-primary text-primary-foreground",
            )}
          >
            Mulai Try Out
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/m/login"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Masuk
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/m/register"
              className="flex flex-1 items-center justify-center rounded-xl border py-3 text-sm font-semibold"
            >
              Daftar Gratis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
