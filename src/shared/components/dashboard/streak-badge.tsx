import { Flame } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  if (currentStreak === 0 && longestStreak === 0) return null;

  const isActive = currentStreak > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
        isActive
          ? "bg-orange-500/10 text-orange-600"
          : "bg-muted text-muted-foreground"
      )}
    >
      <Flame
        className={cn("h-4 w-4", isActive && "text-orange-500")}
      />
      <span className="tabular-nums">{currentStreak}</span>
      <span className="text-xs opacity-70">hari</span>
    </div>
  );
}
