"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  BookOpenCheck,
  GraduationCap,
  Landmark,
  Building2,
  Shield,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MobileNavProps {
  isLoggedIn: boolean;
}

interface MobileCategoryItem {
  title: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const categories: MobileCategoryItem[] = [
  { title: "UTBK-SNBT", href: "/tryout-utbk", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { title: "CPNS", href: "/tryout-cpns", icon: Landmark, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { title: "BUMN", href: "/tryout-bumn", icon: Building2, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { title: "Kedinasan", href: "/tryout-kedinasan", icon: Shield, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { title: "PPPK", href: "/tryout-pppk", icon: FileCheck, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/40" },
];

const platformLinks = [
  { title: "Paket Try Out", href: "/packages" },
  { title: "Harga", href: "/pricing" },
  { title: "Blog", href: "/blog" },
  { title: "FAQ", href: "/faq" },
];

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            Toutopia
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          {/* Kategori Ujian */}
          <div>
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kategori Ujian
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", cat.bg)}>
                    <cat.icon className={cn("h-3.5 w-3.5", cat.color)} />
                  </div>
                  <span className="text-sm font-medium">{cat.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          {/* Platform Links */}
          <div>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform
            </p>
            <nav className="flex flex-col">
              {platformLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.title}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth Buttons */}
          {!isLoggedIn && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <Button asChild className="rounded-lg">
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Daftar Gratis
                  </Link>
                </Button>
                <Button variant="outline" asChild className="rounded-lg">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Masuk
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
