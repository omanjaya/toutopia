"use client";

import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Star } from "lucide-react";
import { toast } from "sonner";

export interface BadgeData {
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

export interface BadgeResponse {
  badges: BadgeData[];
  totalXp: number;
  earnedCount: number;
  totalCount: number;
}

export const BADGE_CATEGORY_LABELS: Record<string, string> = {
  exam: "Ujian",
  streak: "Streak",
  mastery: "Penguasaan",
  social: "Sosial",
};

/**
 * Resolves a Lucide icon component by name string.
 * Falls back to the Star icon if the name is not found.
 */
export function getBadgeIcon(
  name: string,
): React.ComponentType<{ className?: string }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  return icons[name] ?? Star;
}

export interface UseBadgesReturn {
  data: BadgeResponse | null;
  loading: boolean;
  grouped: Record<string, BadgeData[]>;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
}

/**
 * Fetches badge data, shows toasts for newly earned badges, and computes
 * derived values (level, XP progress, grouped badges by category).
 * Shared between desktop (BadgesPage) and mobile (MobileBadgesPage).
 */
export function useBadges(): UseBadgesReturn {
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

  const grouped = (data?.badges ?? []).reduce<Record<string, BadgeData[]>>(
    (acc, badge) => {
      if (!acc[badge.category]) acc[badge.category] = [];
      acc[badge.category].push(badge);
      return acc;
    },
    {},
  );

  const totalXp = data?.totalXp ?? 0;
  const xpForNextLevel = 500;
  const level = Math.floor(totalXp / xpForNextLevel) + 1;
  const xpInLevel = totalXp % xpForNextLevel;

  return { data, loading, grouped, level, xpInLevel, xpForNextLevel };
}
