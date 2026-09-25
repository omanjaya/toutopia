"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface EbookFiltersProps {
  categories: string[];
  currentCategory?: string;
  currentQuery?: string;
}

function EbookFiltersInner({
  categories,
  currentCategory,
  currentQuery,
}: EbookFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery ?? "");
  const [isPending, startTransition] = useTransition();

  function updateFilters(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    startTransition(() => {
      router.push(`/dashboard/ebooks?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ q: query || undefined });
  }

  function handleClear() {
    setQuery("");
    startTransition(() => {
      router.push("/dashboard/ebooks");
    });
  }

  const hasActiveFilters = !!(currentQuery || currentCategory);

  return (
    <div className="space-y-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ebook..."
            className="h-11 pl-9 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <Button type="submit" size="sm" disabled={isPending} className="h-11 sm:h-9">
          Cari
        </Button>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-11 gap-1.5 text-muted-foreground sm:h-9"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </form>

      {/* Category pills — horizontal scroll on mobile, wrap on desktop */}
      {categories.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-2 pb-1 sm:flex-wrap sm:pb-0">
            <button
              type="button"
              onClick={() => updateFilters({ category: undefined })}
              disabled={isPending}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px] sm:h-7 sm:min-h-0 sm:px-3.5 sm:py-0 sm:text-xs sm:leading-7",
                !currentCategory
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground sm:border sm:border-border sm:bg-background sm:hover:border-primary/40 sm:hover:text-foreground"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  updateFilters({
                    category: currentCategory === cat ? undefined : cat,
                  })
                }
                disabled={isPending}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px] sm:h-7 sm:min-h-0 sm:px-3.5 sm:py-0 sm:text-xs sm:leading-7",
                  currentCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground sm:border sm:border-border sm:bg-background sm:hover:border-primary/40 sm:hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function EbookFilters(props: EbookFiltersProps) {
  return (
    <Suspense>
      <EbookFiltersInner {...props} />
    </Suspense>
  );
}
