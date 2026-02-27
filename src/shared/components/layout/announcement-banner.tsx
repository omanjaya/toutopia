"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Info, AlertTriangle, CheckCircle2, Megaphone, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Announcement {
  id: string;
  message: string;
  type: string;
  linkUrl: string | null;
  linkText: string | null;
}

const typeStyles: Record<string, { bg: string; icon: typeof Info }> = {
  info: { bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Info },
  warning: { bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: AlertTriangle },
  success: { bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  promo: { bg: "bg-primary/10 text-primary", icon: Megaphone },
};

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("dismissed-announcements");
    if (stored) {
      try { setDismissed(new Set(JSON.parse(stored))); } catch { /* ignore */ }
    }

    fetch("/api/announcements")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAnnouncements(res.data);
      })
      .catch(() => {});
  }, []);

  function dismiss(id: string) {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem("dismissed-announcements", JSON.stringify([...next]));
  }

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-4 lg:px-6">
      {visible.map((a) => {
        const style = typeStyles[a.type] ?? typeStyles.info;
        const Icon = style.icon;

        return (
          <div
            key={a.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
              style.bg
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <p className="flex-1">{a.message}</p>
            {a.linkUrl && (
              <Link
                href={a.linkUrl}
                className="inline-flex shrink-0 items-center gap-1 font-medium hover:underline"
              >
                {a.linkText ?? "Lihat"}
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            <button
              onClick={() => dismiss(a.id)}
              className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
