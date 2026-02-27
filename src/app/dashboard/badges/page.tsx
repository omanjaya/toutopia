"use client";

import { useState, useEffect } from "react";
import { Loader2, Trophy, Star, Lock } from "lucide-react";
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
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return icons[name] ?? Star;
}

export default function BadgesPage(): React.ReactElement {
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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return <></>;

  // Group by category
  const grouped = data.badges.reduce<Record<string, BadgeData[]>>((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {});

  // XP level calculation
  const level = Math.floor(data.totalXp / 500) + 1;
  const xpInLevel = data.totalXp % 500;
  const xpForNextLevel = 500;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Pencapaian</h2>
        <p className="text-muted-foreground">
          {data.earnedCount} dari {data.totalCount} badge diraih
        </p>
      </div>

      {/* XP & Level Card */}
      <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600">Level {level}</span>
              <span className="text-sm text-muted-foreground">{data.totalXp} XP</span>
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

      {/* Badge Grid by Category */}
      {Object.entries(grouped).map(([category, badges]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {categoryLabels[category] ?? category}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  <CardContent className="flex items-start gap-4 p-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        badge.earned ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      {badge.earned ? (
                        <Icon className="h-6 w-6 text-primary" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{badge.name}</p>
                        {badge.isNew && (
                          <Badge className="bg-amber-500 text-xs">Baru!</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {badge.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          +{badge.xpReward} XP
                        </Badge>
                        {badge.earned && badge.earnedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(badge.earnedAt).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </div>
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
