import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Clock, FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pilih Tryout",
};

interface TryoutPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function MobileTryoutPage({
  searchParams,
}: TryoutPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/m/login");

  const params = await searchParams;
  const selectedCategory = params.category ?? "semua";

  const [categories, packages] = await Promise.all([
    prisma.examCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.examPackage.findMany({
      where: {
        status: "PUBLISHED",
        ...(selectedCategory !== "semua"
          ? { category: { slug: selectedCategory } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        isFree: true,
        durationMinutes: true,
        totalQuestions: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/m/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Pilih Tryout</h1>
      </div>

      {/* Category Filter — horizontal scroll pills */}
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/m/tryout"
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedCategory === "semua"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Semua
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/m/tryout?category=${cat.slug}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Package Cards */}
      {packages.length > 0 ? (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="mb-2 text-[10px]">
                      {pkg.category.name}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-tight">
                      {pkg.title}
                    </h3>
                    {pkg.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {pkg.durationMinutes} menit
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {pkg.totalQuestions} soal
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {pkg.isFree ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      GRATIS
                    </Badge>
                  ) : (
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(pkg.price)}
                    </span>
                  )}
                  <Button size="sm" className="h-9 rounded-full px-5" asChild>
                    <Link href={`/m/dashboard/payment?package=${pkg.slug}`}>
                      Mulai
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Belum ada paket tryout tersedia.
          </p>
        </div>
      )}
    </div>
  );
}
