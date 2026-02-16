import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Trophy, Medal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default async function LeaderboardPage() {
  const session = await auth();

  const packages = await prisma.examPackage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: { select: { name: true } },
      _count: { select: { leaderboard: true } },
    },
  });

  // Get top 3 for each package
  const topEntries = await Promise.all(
    packages.map(async (pkg) => {
      const entries = await prisma.leaderboardEntry.findMany({
        where: { packageId: pkg.id },
        orderBy: { score: "desc" },
        take: 3,
        include: {
          user: { select: { id: true, name: true } },
        },
      });
      return { packageId: pkg.id, entries };
    })
  );

  const topByPackage = new Map(
    topEntries.map((t) => [t.packageId, t.entries])
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
        <p className="text-muted-foreground">
          Peringkat peserta terbaik di setiap paket try out
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const top = topByPackage.get(pkg.id) ?? [];
          const medalColors = [
            "text-amber-500",
            "text-slate-400",
            "text-orange-600",
          ];

          return (
            <Link key={pkg.id} href={`/dashboard/leaderboard/${pkg.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="w-fit mb-1">
                    {pkg.category.name}
                  </Badge>
                  <CardTitle className="text-base">{pkg.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {pkg._count.leaderboard} peserta
                  </p>
                </CardHeader>
                <CardContent>
                  {top.length > 0 ? (
                    <div className="space-y-2">
                      {top.map((entry, idx) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Medal
                            className={`h-4 w-4 ${medalColors[idx] ?? "text-muted-foreground"}`}
                          />
                          <span className="flex-1 truncate">
                            {entry.user.name ?? "Anonim"}
                            {entry.userId === session?.user?.id && (
                              <span className="ml-1 text-xs text-primary">
                                (Anda)
                              </span>
                            )}
                          </span>
                          <span className="font-semibold">
                            {Math.round(entry.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada peserta
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {packages.length === 0 && (
          <div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">
            Belum ada paket try out.
          </div>
        )}
      </div>
    </div>
  );
}
