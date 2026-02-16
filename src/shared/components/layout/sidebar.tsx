"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  CalendarDays,
  Bookmark,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FilePlus,
  Wallet,
  User,
  Users,
  FileCheck,
  Package,
  CreditCard,
  Banknote,
  Newspaper,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import type { NavItem } from "@/config/navigation.config";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  CalendarDays,
  Bookmark,
  FileText,
  FilePlus,
  Wallet,
  User,
  Users,
  FileCheck,
  Package,
  CreditCard,
  Banknote,
  Newspaper,
  Settings,
};

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ items, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden border-r bg-background transition-all duration-300 lg:flex lg:flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenCheck className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-lg font-bold">Toutopia</span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {items.map((item) => {
            const Icon = item.icon ? iconMap[item.icon] : LayoutDashboard;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="mr-2 h-4 w-4" />
              Tutup
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
