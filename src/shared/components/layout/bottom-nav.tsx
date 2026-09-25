"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  LayoutDashboard,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface NavTab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const desktopTabs: NavTab[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/dashboard/tryout", label: "Tryout", icon: FileText },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/subscriptions", label: "Akun", icon: User },
];

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface BottomNavProps {
  tabs?: NavTab[];
  className?: string;
}

export function BottomNav({ tabs = desktopTabs, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]", className)}>
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 min-h-[44px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-tight">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
