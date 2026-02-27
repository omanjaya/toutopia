"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface MobileEbookFiltersProps {
  categories: string[];
  currentCategory?: string;
  currentQuery?: string;
}

function FiltersInner({
  categories,
  currentCategory,
  currentQuery,
}: MobileEbookFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery ?? "");
  const [isPending, startTransition] = useTransition();

  function updateFilters(updates: Record<string, string | undefined>): void {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    startTransition(() => {
      router.push(`/m/dashboard/ebooks?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent): void {
    e.preventDefault();
    updateFilters({ q: query || undefined });
  }

  function handleClear(): void {
    setQuery("");
    startTransition(() => {
      router.push("/m/dashboard/ebooks");
    });
  }

  return (
    <div className="mb-5 space-y-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ebook..."
            className="h-11 pl-9 text-base"
          />
        </div>
        {(currentQuery || currentCategory) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Category pills - horizontal scroll */}
      {categories.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => updateFilters({ category: undefined })}
              disabled={isPending}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px]",
                !currentCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
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
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px]",
                  currentCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
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

export function MobileEbookFilters(props: MobileEbookFiltersProps) {
  return (
    <Suspense>
      <FiltersInner {...props} />
    </Suspense>
  );
}
