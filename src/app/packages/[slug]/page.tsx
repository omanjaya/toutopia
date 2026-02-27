import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
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
import {
  Clock,
  FileText,
  Shield,
  Users,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  BookOpen,
  Trophy,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPackage(slug: string) {
  return prisma.examPackage.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true, slug: true } },
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

  return {
    title: `${pkg.title} — Toutopia`,
    description:
      pkg.description ??
      `Try out ${pkg.category.name} dengan ${pkg.totalQuestions} soal, ${pkg.durationMinutes} menit. Latihan berkualitas di Toutopia.`,
    openGraph: {
      title: `${pkg.title} — Toutopia`,
      description:
        pkg.description ??
        `Try out ${pkg.category.name} — ${pkg.totalQuestions} soal, ${pkg.durationMinutes} menit.`,
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) notFound();

  const session = await auth();
  const isLoggedIn = !!session?.user;

  const stats = [
    { icon: FileText, label: "Soal", value: pkg.totalQuestions.toString(), color: "bg-blue-500/10 text-blue-600" },
    { icon: Clock, label: "Menit", value: pkg.durationMinutes.toString(), color: "bg-amber-500/10 text-amber-600" },
    { icon: RotateCcw, label: "Percobaan", value: `${pkg.maxAttempts}x`, color: "bg-emerald-500/10 text-emerald-600" },
    { icon: Shield, label: "Anti-Cheat", value: pkg.isAntiCheat ? "Aktif" : "Off", color: "bg-purple-500/10 text-purple-600" },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/packages"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Semua Paket
        </Link>

        <div className="space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-background/80">
                  {pkg.category.name}
                </Badge>
                {pkg.isFree && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Gratis</Badge>
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
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {pkg._count.attempts.toLocaleString("id-ID")} peserta
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex flex-col items-center py-5">
                  <div className={cn("mb-2 flex h-10 w-10 items-center justify-center rounded-xl", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Price */}
          <Card>
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Harga</p>
                {pkg.isFree ? (
                  <p className="text-2xl font-bold text-emerald-600">Gratis</p>
                ) : pkg.discountPrice !== null ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      {formatCurrency(pkg.discountPrice)}
                    </p>
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(pkg.price)}
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      -{Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100)}%
                    </Badge>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">
                    {formatCurrency(pkg.price)}
                  </p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Struktur Ujian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pkg.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
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
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 text-center">
              {isLoggedIn ? (
                <>
                  <p className="mb-4 text-muted-foreground">
                    Siap mengerjakan try out ini?
                  </p>
                  <Button asChild size="lg">
                    <Link href={`/dashboard/tryout/${pkg.id}`}>
                      Mulai Try Out
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-4 text-muted-foreground">
                    Masuk atau daftar untuk mengerjakan try out ini
                  </p>
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button asChild size="lg">
                      <Link href="/login">
                        Masuk
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/register">Daftar Gratis</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
