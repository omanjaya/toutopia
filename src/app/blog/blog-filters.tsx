"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface BlogFiltersProps {
  categories: string[];
  currentCategory?: string;
  currentQuery?: string;
}

function BlogFiltersInner({ categories, currentCategory, currentQuery }: BlogFiltersProps) {
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
      router.push(`/blog?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ q: query || undefined });
  }

  function handleClear() {
    setQuery("");
    startTransition(() => {
      router.push("/blog");
    });
  }

  return (
    <div className="mb-5 space-y-3 md:mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="h-11 pl-9 text-base md:h-10 md:text-sm"
          />
        </div>
        <Button type="submit" disabled={isPending} className="h-11 md:h-10">
          Cari
        </Button>
        {(currentQuery || currentCategory) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 md:h-10 md:w-10"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {categories.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => updateFilters({ category: undefined })}
              disabled={isPending}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px]",
                !currentCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                disabled={isPending}
                onClick={() =>
                  updateFilters({
                    category: currentCategory === cat ? undefined : cat,
                  })
                }
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px]",
                  currentCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
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

export function BlogFilters(props: BlogFiltersProps) {
  return (
    <Suspense>
      <BlogFiltersInner {...props} />
    </Suspense>
  );
}
