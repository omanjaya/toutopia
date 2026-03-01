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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ebook..."
            className="pl-9 h-9"
          />
        </div>
        <Button type="submit" size="sm" disabled={isPending} className="h-9">
          Cari
        </Button>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-muted-foreground"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </form>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilters({ category: undefined })}
            className={cn(
              "h-7 rounded-full px-3.5 text-xs font-medium transition-colors",
              !currentCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
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
              className={cn(
                "h-7 rounded-full px-3.5 text-xs font-medium transition-colors",
                currentCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
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
