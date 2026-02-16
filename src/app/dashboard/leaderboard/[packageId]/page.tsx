import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard Paket",
};

export default async function PackageLeaderboardPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;
  const session = await auth();

  const pkg = await prisma.examPackage.findUnique({
    where: { id: packageId },
    select: { id: true, title: true, category: { select: { name: true } } },
  });

  if (!pkg) notFound();

  const entries = await prisma.leaderboardEntry.findMany({
    where: { packageId },
    orderBy: { score: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      attempt: {
        select: { totalCorrect: true, finishedAt: true },
      },
    },
  });

  const medalColors = [
    "text-amber-500",
    "text-slate-400",
    "text-orange-600",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/leaderboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">
            {pkg.title} &middot; {pkg.category.name}
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map((idx) => {
            const entry = entries[idx];
            if (!entry) return null;
            const rank = idx + 1;

            return (
              <Card
                key={entry.id}
                className={cn(
                  "text-center",
                  rank === 1 && "border-amber-500 sm:col-start-2 sm:row-start-1"
                )}
              >
                <CardContent className="pt-6">
                  <Trophy
                    className={cn(
                      "mx-auto mb-2 h-8 w-8",
                      medalColors[idx] ?? "text-muted-foreground"
                    )}
                  />
                  <p className="text-2xl font-bold">#{rank}</p>
                  <p className="font-medium truncate">
                    {entry.user.name ?? "Anonim"}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {Math.round(entry.score)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Peringkat Lengkap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {entries.map((entry, idx) => {
              const isCurrentUser = entry.user.id === session?.user?.id;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    isCurrentUser && "bg-primary/5 font-medium"
                  )}
                >
                  <span className="w-8 text-right font-mono">
                    {idx < 3 ? (
                      <Medal
                        className={cn(
                          "inline h-4 w-4",
                          medalColors[idx] ?? "text-muted-foreground"
                        )}
                      />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span className="flex-1 truncate">
                    {entry.user.name ?? "Anonim"}
                    {isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Anda
                      </Badge>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {entry.attempt.totalCorrect ?? "-"} benar
                  </span>
                  <span className="w-16 text-right font-bold">
                    {Math.round(entry.score)}
                  </span>
                </div>
              );
            })}

            {entries.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                Belum ada peserta di leaderboard ini.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
