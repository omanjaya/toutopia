"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, Package, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { NavItem } from "@/config/navigation.config";

interface SearchResult {
  packages: { id: string; title: string; slug: string }[];
  articles: { id: string; title: string; slug: string }[];
}

interface SearchCommandProps {
  navItems: NavItem[];
}

export function SearchCommand({ navItems }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [contentResults, setContentResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
        if (data.success) {
          setContentResults(data.data);
        }
      } catch {
        // Silently fail
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const filtered = navItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setContentResults(null);
      router.push(href);
    },
    [router]
  );

  const hasContentResults =
    contentResults &&
    (contentResults.packages.length > 0 || contentResults.articles.length > 0);

  const hasResults = filtered.length > 0 || hasContentResults;

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
            <DialogTitle>Pencarian</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari halaman, paket, atau artikel..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  handleSelect(filtered[0].href);
                }
              }}
            />
            <kbd className="inline-flex h-5 items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {!hasResults && !searching ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {query ? "Tidak ditemukan" : "Ketik untuk mencari..."}
              </p>
            ) : (
              <>
                {/* Navigation Results */}
                {filtered.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Halaman
                    </p>
                    {filtered.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.href}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Package Results */}
                {contentResults && contentResults.packages.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Paket Ujian
                    </p>
                    {contentResults.packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => handleSelect(`/packages/${pkg.slug}`)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{pkg.title}</p>
                          <p className="text-xs text-muted-foreground">/packages/{pkg.slug}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Article Results */}
                {contentResults && contentResults.articles.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Artikel
                    </p>
                    {contentResults.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleSelect(`/blog/${article.slug}`)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                          <FileText className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-xs text-muted-foreground">/blog/{article.slug}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searching && (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    Mencari...
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
