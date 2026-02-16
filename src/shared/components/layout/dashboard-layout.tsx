"use client";

import { useState } from "react";
import { Menu, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Sidebar } from "./sidebar";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import type { NavItem } from "@/config/navigation.config";
import type { SessionUser } from "@/shared/types/user.types";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {};

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: SessionUser;
  navItems: NavItem[];
}

export function DashboardLayout({
  children,
  user,
  navItems,
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
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b px-4 py-4">
                  <SheetTitle className="flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-primary" />
                    Toutopia
                  </SheetTitle>
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
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

            <h1 className="text-lg font-semibold">
              {currentPage?.title ?? "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
