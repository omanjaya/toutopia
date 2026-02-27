"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpenCheck,
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  CalendarDays,
  Bookmark,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  FilePlus,
  Wallet,
  User,
  Users,
  UsersRound,
  FileCheck,
  Package,
  CreditCard,
  Banknote,
  GraduationCap,
  Newspaper,
  Settings,
  Sparkles,
  BookText,
  Trophy,
  ScrollText,
  Dumbbell,
  Tag,
  Zap,
  Radio,
  Brain,
  Crown,
  MessageCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import type { NavItem } from "@/config/navigation.config";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
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
  UsersRound,
  FileCheck,
  Package,
  CreditCard,
  Banknote,
  GraduationCap,
  Newspaper,
  Settings,
  Sparkles,
  BookText,
  Trophy,
  ScrollText,
  Dumbbell,
  Tag,
  Zap,
  Radio,
  Brain,
  Crown,
  MessageCircle,
  Shield,
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
        "hidden border-r border-sidebar-border bg-sidebar/80 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 lg:flex lg:flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <BookOpenCheck className="h-5 w-5 shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight">Toutopia</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        {!collapsed && (
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
            Menu
          </p>
        )}
        <nav className="flex flex-col gap-0.5">
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
                  "group flex items-center gap-3 rounded-lg px-2.5 py-[7px] text-[13px] transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "h-[17px] w-[17px] shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/70"
                    )}
                  />
                )}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>
      </ScrollArea>

      {/* Bottom — collapsed toggle */}
      {collapsed && (
        <div className="border-t border-sidebar-border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                className="flex h-8 w-full items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Buka sidebar</TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  );
}
