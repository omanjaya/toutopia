"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Trophy, Star, Lock, ArrowLeft } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

interface BadgeData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
  isNew: boolean;
}

interface BadgeResponse {
  badges: BadgeData[];
  totalXp: number;
  earnedCount: number;
  totalCount: number;
}

const categoryLabels: Record<string, string> = {
  exam: "Ujian",
  streak: "Streak",
  mastery: "Penguasaan",
  social: "Sosial",
};

function getIcon(name: string): React.ComponentType<{ className?: string }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  return icons[name] ?? Star;
}

export default function MobileBadgesPage(): React.ReactElement {
  const [data, setData] = useState<BadgeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/badges")
      .then((r) => r.json())
      .then((res: { success: boolean; data: BadgeResponse }) => {
        if (res.success) {
          setData(res.data);
          const newBadges = res.data.badges.filter((b) => b.isNew);
          for (const badge of newBadges) {
            toast.success(`Badge baru: ${badge.name}!`, {
              description: badge.description,
            });
          }
        }
      })
      .catch(() => toast.error("Gagal memuat data badge"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return <></>;

  // Group by category
  const grouped = data.badges.reduce<Record<string, BadgeData[]>>(
    (acc, badge) => {
      if (!acc[badge.category]) acc[badge.category] = [];
      acc[badge.category].push(badge);
      return acc;
    },
    {}
  );

  // XP level calculation
  const level = Math.floor(data.totalXp / 500) + 1;
  const xpInLevel = data.totalXp % 500;
  const xpForNextLevel = 500;

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
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Pencapaian</h1>
          <p className="text-xs text-muted-foreground">
            {data.earnedCount} dari {data.totalCount} badge diraih
          </p>
        </div>
      </div>

      {/* XP & Level Card */}
      <Card className="mb-5 border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
            <Trophy className="h-7 w-7 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">
                Level {level}
              </span>
              <span className="text-xs text-muted-foreground">
                {data.totalXp} XP
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-200/50">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${(xpInLevel / xpForNextLevel) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {xpForNextLevel - xpInLevel} XP lagi ke Level {level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-primary">{data.earnedCount}</p>
            <p className="text-[10px] text-muted-foreground">Diraih</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-muted-foreground">
              {data.totalCount - data.earnedCount}
            </p>
            <p className="text-[10px] text-muted-foreground">Terkunci</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{data.totalXp}</p>
            <p className="text-[10px] text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
      </div>

      {/* Badge Grid by Category */}
      {Object.entries(grouped).map(([category, badges]) => (
        <div key={category} className="mb-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {categoryLabels[category] ?? category}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((badge) => {
              const Icon = getIcon(badge.icon);
              return (
                <Card
                  key={badge.id}
                  className={cn(
                    "border-0 shadow-sm transition-all",
                    badge.earned ? "bg-card" : "bg-muted/30 opacity-60"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          badge.earned ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        {badge.earned ? (
                          <Icon className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                      {badge.isNew && (
                        <Badge className="bg-amber-500 text-[10px] px-1.5 py-0">
                          Baru!
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-tight">
                      {badge.name}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground line-clamp-2">
                      {badge.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        +{badge.xpReward} XP
                      </Badge>
                      {badge.earned && badge.earnedAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(badge.earnedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
