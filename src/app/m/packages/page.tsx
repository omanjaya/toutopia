import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Package, FileText, Users, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatCurrency } from "@/shared/lib/utils";
import { getCategoryTheme } from "@/shared/lib/category-colors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paket Try Out",
  description:
    "Jelajahi semua paket try out UTBK, CPNS, BUMN, Kedinasan, dan PPPK. Latihan soal berkualitas dengan pembahasan lengkap.",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface SearchParams {
  category?: string;
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

interface PackageRowProps {
  slug: string;
  title: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  isFree: boolean;
  totalQuestions: number;
  durationMinutes: number;
  participantCount: number;
  categoryName: string;
  categorySlug: string;
}

function PackageRow({
  slug,
  title,
  description,
  price,
  discountPrice,
  isFree,
  totalQuestions,
  durationMinutes,
  participantCount,
  categoryName,
  categorySlug,
}: PackageRowProps): React.ReactElement {
  const theme = getCategoryTheme(categorySlug);

  return (
    <Link href={`/m/packages/${slug}`}>
      <div
        className={cn(
          cardCls,
          "flex flex-col gap-3 p-4 transition-transform active:scale-[0.98]",
        )}
      >
        {/* Top row: category badge + participant count */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              theme.bg,
              theme.text,
            )}
          >
            {categoryName}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" strokeWidth={1.5} />
            {participantCount.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Meta row: soal + durasi */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            {totalQuestions} soal
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" strokeWidth={1.5} />
            {durationMinutes} menit
          </span>
        </div>

        {/* Price */}
        <div>
          {isFree ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-0.5 text-sm font-semibold text-emerald-700">
              Gratis
            </span>
          ) : discountPrice !== null ? (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold">
                {formatCurrency(discountPrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                -{Math.round(((price - discountPrice) / price) * 100)}%
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold">{formatCurrency(price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function MobilePackagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const activeCategory = params.category ?? "";
  const sort = params.sort ?? "";

  const [categories, packages, aggregateStats, totalParticipants] =
    await Promise.all([
      prisma.examCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      }),
      prisma.examPackage.findMany({
        where: {
          status: "PUBLISHED",
          ...(activeCategory ? { category: { slug: activeCategory } } : {}),
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
      prisma.examAttempt.count(),
    ]);

  const freePackages = packages.filter((p) => p.isFree);
  const premiumPackages = packages.filter((p) => !p.isFree);
  const isFiltered = activeCategory !== "" || sort !== "";

  const sortOptions = [
    { label: "Terbaru", value: "" },
    { label: "Populer", value: "populer" },
    { label: "Harga Terendah", value: "harga-asc" },
    { label: "Harga Tertinggi", value: "harga-desc" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Paket Try Out</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih paket latihan sesuai kebutuhanmu
        </p>
      </div>

      {/* Stats Strip */}
      <div className={cn(cardCls, "mb-5 grid grid-cols-3 divide-x")}>
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

      {/* Category Filter Pills */}
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/m/packages"
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeCategory === ""
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Semua
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/m/packages?category=${cat.slug}${sort ? `&sort=${sort}` : ""}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Sort Pills */}
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sortOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/m/packages?${activeCategory ? `category=${activeCategory}&` : ""}sort=${opt.value}`}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              sort === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Result count */}
      <p className="mb-4 text-xs text-muted-foreground">
        Menampilkan {packages.length} paket
      </p>

      {/* Package List */}
      {packages.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Search className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold">Tidak ada paket</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {isFiltered
              ? "Tidak ada paket yang cocok dengan filter."
              : "Belum ada paket try out yang tersedia."}
          </p>
          {isFiltered && (
            <Link
              href="/m/packages"
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
            >
              Lihat Semua
            </Link>
          )}
        </div>
      ) : isFiltered ? (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <PackageRow
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
        <div className="space-y-8">
          {freePackages.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-emerald-500" />
                <h2 className="text-base font-semibold">Paket Gratis</h2>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {freePackages.length}
                </span>
              </div>
              <div className="space-y-3">
                {freePackages.map((pkg) => (
                  <PackageRow
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
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-primary" />
                <h2 className="text-base font-semibold">Paket Premium</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {premiumPackages.length}
                </span>
              </div>
              <div className="space-y-3">
                {premiumPackages.map((pkg) => (
                  <PackageRow
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
      )}

      {/* Bottom CTA */}
      <div className={cn(cardCls, "mt-8 p-5 text-center")}>
        <p className="text-sm font-semibold">Belum punya akun?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Daftar gratis dan dapatkan 2 kredit try out
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/m/register"
            className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/m/login"
            className="flex-1 rounded-xl border py-2.5 text-center text-sm font-semibold"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
