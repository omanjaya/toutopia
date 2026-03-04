export interface LiveEventPackage {
  id: string;
  title: string;
  slug: string;
  totalQuestions: number;
  durationMinutes: number;
  category: { name: string; slug: string };
}

export interface LiveEventItem {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  endAt: string | null;
  status: string;
  maxParticipants: number | null;
  package: LiveEventPackage;
  _count: { registrations: number };
}

export type LiveEventTabType = "upcoming" | "past";

export interface LiveEventStatusBadge {
  label: string;
  variant: "default" | "destructive" | "secondary" | "outline";
}

export function getLiveEventStatusBadge(event: LiveEventItem): LiveEventStatusBadge {
  const now = new Date();
  const scheduled = new Date(event.scheduledAt);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (event.status === "LIVE") return { label: "LIVE", variant: "destructive" };
  if (diffHours < 1 && diffHours > 0)
    return { label: "Segera Dimulai", variant: "default" };
  if (event.status === "ENDED") return { label: "Selesai", variant: "secondary" };
  return { label: "Terjadwal", variant: "outline" };
}

export function formatLiveEventTime(dateStr: string): string {
  return (
    new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}
