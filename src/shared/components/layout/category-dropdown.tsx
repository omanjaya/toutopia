"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getCategoryTheme } from "@/shared/lib/category-colors";

const categories = [
  { title: "UTBK-SNBT", slug: "utbk-snbt", description: "Seleksi masuk PTN", href: "/tryout-utbk" },
  { title: "CPNS", slug: "cpns", description: "TWK, TIU, TKP", href: "/tryout-cpns" },
  { title: "BUMN", slug: "bumn", description: "Rekrutmen Bersama", href: "/tryout-bumn" },
  { title: "Kedinasan", slug: "kedinasan", description: "STAN, STIS, IPDN", href: "/tryout-kedinasan" },
  { title: "PPPK", slug: "pppk", description: "Kompetensi teknis", href: "/tryout-pppk" },
];

export function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleEnter(): void {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave(): void {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors",
          open
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Kategori
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-[320px] -translate-x-1/2 pt-2 transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-xl border border-border/60 bg-popover p-2 shadow-lg">
          {categories.map((cat) => {
            const theme = getCategoryTheme(cat.slug);
            const Icon = theme.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    theme.bg
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", theme.text)} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {cat.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cat.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
