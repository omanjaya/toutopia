"use client";

import { useState } from "react";
import { Menu, BookOpenCheck, Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import dynamic from "next/dynamic";
import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { DarkModeToggle } from "./dark-mode-toggle";
import { AnnouncementBanner } from "./announcement-banner";
import { OfflineIndicator } from "@/shared/components/shared/offline-indicator";

const NotificationBell = dynamic(() => import("./notification-bell").then((m) => ({ default: m.NotificationBell })));
const SearchCommand = dynamic(() => import("./search-command").then((m) => ({ default: m.SearchCommand })));
import type { NavItem } from "@/config/navigation.config";
import type { SessionUser } from "@/shared/types/user.types";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {};

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: SessionUser;
  navItems: NavItem[];
  planLabel?: string | null;
}

export function DashboardLayout({
  children,
  user,
  navItems,
  planLabel,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const currentPage = navItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        items={navItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background/70 backdrop-blur-2xl backdrop-saturate-150 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                <SheetHeader className="border-b px-4 py-4">
                  <SheetTitle className="flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-primary" />
                    Toutopia
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Menu navigasi
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-65px)]">
                  <nav className="flex flex-col gap-1 p-2">
                    {navItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                          pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                            isActive
                              ? "bg-primary/12 text-primary font-medium shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground font-normal"
                          )}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <h1 className="text-base font-medium">
              {currentPage?.title ?? "Dashboard"}
            </h1>
            {planLabel && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Crown className="h-3 w-3" />
                {planLabel}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SearchCommand navItems={navItems} />
            <DarkModeToggle />
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </header>

        {/* Announcements + Main content */}
        <div className="flex-1 overflow-y-auto">
          <AnnouncementBanner />
          <main className="p-6 lg:p-8">{children}</main>
          <OfflineIndicator />
        </div>
      </div>
    </div>
  );
}
