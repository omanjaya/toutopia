import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/shared/components/ui/avatar";
import { Trophy, Medal, ArrowRight, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard — Toutopia",
  description:
    "Lihat peringkat peserta terbaik di setiap paket try out Toutopia.",
  openGraph: {
    title: "Leaderboard — Toutopia",
    description: "Peringkat peserta terbaik di setiap paket try out.",
  },
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function PublicLeaderboardPage() {
  const packages = await prisma.examPackage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { name: true } },
      _count: { select: { leaderboard: true } },
    },
  });

  const topEntries = await Promise.all(
    packages.map(async (pkg) => {
      const entries = await prisma.leaderboardEntry.findMany({
        where: { packageId: pkg.id },
        orderBy: { score: "desc" },
        take: 3,
        include: {
          user: { select: { name: true, avatar: true } },
        },
      });
      return { packageId: pkg.id, entries };
    })
  );

  const topByPackage = new Map(
    topEntries.map((t) => [t.packageId, t.entries])
  );

  const totalParticipants = packages.reduce(
    (sum, pkg) => sum + pkg._count.leaderboard,
    0
  );

  const medalColors = [
    "text-amber-500",
    "text-slate-400",
    "text-orange-600",
  ];

  const medalBg = [
    "bg-amber-500/10",
    "bg-slate-400/10",
    "bg-orange-600/10",
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-500/5 via-primary/5 to-transparent" />
          <div className="absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Leaderboard
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Peringkat peserta terbaik di setiap paket try out. Kerjakan try
                out dan raih peringkat teratas!
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {totalParticipants.toLocaleString("id-ID")} peserta terdaftar
              </div>
            </div>

            {/* Package Grid */}
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const top = topByPackage.get(pkg.id) ?? [];
                const highestScore = top[0] ? Math.round(top[0].score) : null;

                return (
                  <Link key={pkg.id} href={`/leaderboard/${pkg.id}`}>
                    <Card className="group h-full transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="outline">{pkg.category.name}</Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {pkg._count.leaderboard}
                          </span>
                        </div>
                        <CardTitle className="mt-2 text-base leading-snug">
                          {pkg.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {top.length > 0 ? (
                          <div className="space-y-3">
                            {/* Top 3 entries */}
                            <div className="space-y-2">
                              {top.map((entry, idx) => (
                                <div
                                  key={entry.id}
                                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm ${medalBg[idx]}`}
                                >
                                  <Medal
                                    className={`h-4 w-4 shrink-0 ${medalColors[idx]}`}
                                  />
                                  <Avatar size="sm">
                                    {entry.user.avatar && (
                                      <AvatarImage src={entry.user.avatar} alt={entry.user.name ?? ""} />
                                    )}
                                    <AvatarFallback className="text-[10px]">
                                      {getInitials(entry.user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="flex-1 truncate font-medium">
                                    {entry.user.name ?? "Anonim"}
                                  </span>
                                  <span className="font-bold tabular-nums">
                                    {Math.round(entry.score)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Avatar group + highest score */}
                            <div className="flex items-center justify-between border-t pt-3">
                              <AvatarGroup>
                                {top.map((entry) => (
                                  <Avatar key={entry.id} size="sm">
                                    {entry.user.avatar && (
                                      <AvatarImage src={entry.user.avatar} alt={entry.user.name ?? ""} />
                                    )}
                                    <AvatarFallback className="text-[10px]">
                                      {getInitials(entry.user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </AvatarGroup>
                              {highestScore !== null && (
                                <span className="text-xs text-muted-foreground">
                                  Top skor: <span className="font-bold text-foreground">{highestScore}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-4 text-muted-foreground">
                            <Trophy className="mb-2 h-8 w-8 opacity-20" />
                            <p className="text-sm">Belum ada peserta</p>
                            <p className="text-xs">Jadilah yang pertama!</p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center text-xs font-medium text-primary transition-colors group-hover:text-primary/80">
                          Lihat selengkapnya
                          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}

              {packages.length === 0 && (
                <div className="col-span-full flex flex-col items-center rounded-2xl border border-dashed p-16 text-center text-muted-foreground">
                  <Trophy className="mb-4 h-12 w-12 opacity-20" />
                  <p className="text-lg font-medium">Belum ada paket try out</p>
                  <p className="mt-1 text-sm">Nantikan paket try out segera hadir.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
