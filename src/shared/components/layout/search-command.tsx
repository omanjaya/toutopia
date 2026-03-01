"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Package,
  FileText,
  Plus,
  FilePlus,
  Layers,
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  CalendarDays,
  Bookmark,
  Wallet,
  User,
  Users,
  UsersRound,
  FileCheck,
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
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  Layers,
};

interface SearchResult {
  packages: { id: string; title: string; slug: string }[];
  articles: { id: string; title: string; slug: string }[];
}

interface SearchCommandProps {
  navItems: NavItem[];
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchCommand({ navItems }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [contentResults, setContentResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  const isAdmin = navItems.some((item) => item.href.startsWith("/admin/"));
  const isTeacher = navItems.some((item) => item.href.startsWith("/teacher/"));

  const quickActions = isAdmin
    ? [
        { title: "Buat Paket Ujian", href: "/admin/packages/new", icon: Plus, color: "bg-primary/10 text-primary" },
        { title: "Tambah Soal", href: "/admin/questions/new", icon: FilePlus, color: "bg-violet-500/10 text-violet-600" },
        { title: "Buat Seri Paket", href: "/admin/packages/series/new", icon: Layers, color: "bg-blue-500/10 text-blue-600" },
        { title: "Tambah Pengguna", href: "/admin/users/new", icon: Users, color: "bg-emerald-500/10 text-emerald-600" },
      ]
    : isTeacher
    ? [
        { title: "Buat Soal Baru", href: "/teacher/questions/new", icon: FilePlus, color: "bg-primary/10 text-primary" },
      ]
    : [
        { title: "Mulai Try Out", href: "/dashboard/tryout", icon: BookOpen, color: "bg-primary/10 text-primary" },
        { title: "Daily Challenge", href: "/dashboard/daily-challenge", icon: Zap, color: "bg-amber-500/10 text-amber-600" },
        { title: "Study Planner", href: "/dashboard/planner", icon: CalendarDays, color: "bg-emerald-500/10 text-emerald-600" },
      ];

  // Global Cmd+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setContentResults(null);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search API
  useEffect(() => {
    if (!query || query.length < 2) {
      setContentResults(null);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) setContentResults(data.data);
      } catch {
        // silent fail
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const filteredNav = query
    ? navItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : navItems.slice(0, 6);

  // Flat list for arrow-key navigation
  const allItems: { href: string }[] = query
    ? [
        ...filteredNav.map((item) => ({ href: item.href })),
        ...(contentResults?.packages.map((p) => ({ href: `/packages/${p.slug}` })) ?? []),
        ...(contentResults?.articles.map((a) => ({ href: `/blog/${a.slug}` })) ?? []),
      ]
    : [
        ...quickActions.map((a) => ({ href: a.href })),
        ...filteredNav.map((item) => ({ href: item.href })),
      ];

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (allItems[selectedIndex]) handleSelect(allItems[selectedIndex].href);
      }
    },
    [allItems, selectedIndex, handleSelect]
  );

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, contentResults]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Cari...</span>
        <kbd className="ml-4 inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] translate-y-0 p-0 gap-0 max-w-lg shadow-[0_16px_70px_rgba(0,0,0,0.15)] border-border/40 rounded-2xl overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Pencarian &amp; Navigasi</DialogTitle>
          </VisuallyHidden>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari halaman, paket, atau artikel..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {searching && (
              <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-muted border-t-primary" />
            )}
            <kbd className="inline-flex h-5 shrink-0 items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2">
            {!query ? (
              <>
                {/* Quick Actions */}
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Aksi Cepat
                  </p>
                  {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.href}
                        data-idx={i}
                        onClick={() => handleSelect(action.href)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                          selectedIndex === i ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${action.color}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">{action.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Nav shortcuts */}
                <div className="mt-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Navigasi
                  </p>
                  {filteredNav.map((item, i) => {
                    const Icon = item.icon ? (iconMap[item.icon] ?? LayoutDashboard) : LayoutDashboard;
                    const globalIdx = quickActions.length + i;
                    return (
                      <button
                        key={item.href}
                        data-idx={globalIdx}
                        onClick={() => handleSelect(item.href)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                          selectedIndex === globalIdx ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.href}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : filteredNav.length === 0 && !contentResults && !searching ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ditemukan untuk &ldquo;{query}&rdquo;
              </p>
            ) : (
              <>
                {/* Filtered navigation */}
                {filteredNav.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Halaman
                    </p>
                    {filteredNav.map((item, i) => {
                      const Icon = item.icon ? (iconMap[item.icon] ?? LayoutDashboard) : LayoutDashboard;
                      return (
                        <button
                          key={item.href}
                          data-idx={i}
                          onClick={() => handleSelect(item.href)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                            selectedIndex === i ? "bg-muted" : "hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{highlightMatch(item.title, query)}</p>
                            <p className="text-xs text-muted-foreground">{item.href}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Package results */}
                {contentResults && contentResults.packages.length > 0 && (
                  <div className="mt-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Paket Ujian
                    </p>
                    {contentResults.packages.map((pkg, i) => {
                      const globalIdx = filteredNav.length + i;
                      return (
                        <button
                          key={pkg.id}
                          data-idx={globalIdx}
                          onClick={() => handleSelect(`/packages/${pkg.slug}`)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                            selectedIndex === globalIdx ? "bg-muted" : "hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{highlightMatch(pkg.title, query)}</p>
                            <p className="text-xs text-muted-foreground">/packages/{pkg.slug}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Article results */}
                {contentResults && contentResults.articles.length > 0 && (
                  <div className="mt-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Artikel
                    </p>
                    {contentResults.articles.map((article, i) => {
                      const globalIdx =
                        filteredNav.length + (contentResults.packages?.length ?? 0) + i;
                      return (
                        <button
                          key={article.id}
                          data-idx={globalIdx}
                          onClick={() => handleSelect(`/blog/${article.slug}`)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                            selectedIndex === globalIdx ? "bg-muted" : "hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                            <FileText className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">{highlightMatch(article.title, query)}</p>
                            <p className="text-xs text-muted-foreground">/blog/{article.slug}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer keyboard hints */}
          <div className="flex items-center gap-4 border-t border-border/40 px-4 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
              <kbd className="inline-flex h-4 items-center rounded border border-border/60 bg-muted px-1 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="inline-flex h-4 items-center rounded border border-border/60 bg-muted px-1 font-mono text-[10px]">
                ↓
              </kbd>
              <span>navigasi</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
              <kbd className="inline-flex h-4 items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px]">
                ↵
              </kbd>
              <span>pilih</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
              <kbd className="inline-flex h-4 items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px]">
                ESC
              </kbd>
              <span>tutup</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
