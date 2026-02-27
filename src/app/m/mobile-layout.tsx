"use client";

import { MobileHeader } from "@/shared/components/layout/mobile-header";
import { BottomNav } from "@/shared/components/layout/bottom-nav";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background">
      <MobileHeader />
      <main className="pt-14 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
