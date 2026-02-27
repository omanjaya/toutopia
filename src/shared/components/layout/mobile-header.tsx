"use client";

import dynamic from "next/dynamic";
import { BookOpenCheck } from "lucide-react";
import { DarkModeToggle } from "@/shared/components/layout/dark-mode-toggle";

const NotificationBell = dynamic(
  () =>
    import("@/shared/components/layout/notification-bell").then(
      (mod) => mod.NotificationBell
    ),
  { ssr: false }
);

export function MobileHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-lg">
      <div className="flex items-center gap-2">
        <BookOpenCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
        <span className="text-base font-bold tracking-tight text-foreground">
          Toutopia
        </span>
      </div>
      <div className="flex items-center gap-1">
        <DarkModeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
