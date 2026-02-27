"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, X } from "lucide-react";

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
    <div className="mb-6 space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Cari
        </Button>
        {(currentQuery || currentCategory) && (
          <Button type="button" variant="ghost" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!currentCategory ? "default" : "outline"}
            onClick={() => updateFilters({ category: undefined })}
          >
            Semua
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={currentCategory === cat ? "default" : "outline"}
              onClick={() =>
                updateFilters({
                  category: currentCategory === cat ? undefined : cat,
                })
              }
            >
              {cat}
            </Button>
          ))}
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
