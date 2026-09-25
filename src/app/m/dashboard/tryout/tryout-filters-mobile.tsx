"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MobileTryoutFiltersProps {
  categories: Category[];
  currentQ: string;
  currentCategory: string;
  currentSort: string;
}

const sortOptions = [
  { value: "", label: "Terbaru" },
  { value: "populer", label: "Populer" },
  { value: "gratis", label: "Gratis" },
  { value: "berbayar", label: "Berbayar" },
];

function buildHref(
  q: string,
  category: string,
  sort: string,
): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return `/m/dashboard/tryout${qs ? `?${qs}` : ""}`;
}

export function MobileTryoutFilters({
  categories,
  currentQ,
  currentCategory,
  currentSort,
}: MobileTryoutFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentQ);

  function navigate(q: string, category: string, sort: string) {
    startTransition(() => {
      router.push(buildHref(q, category, sort));
    });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate(searchValue, currentCategory, currentSort);
  }

  function handleClearSearch() {
    setSearchValue("");
    navigate("", currentCategory, currentSort);
  }

  // Suppress unused variable warning — pathname may be used for active state
  void pathname;

  return (
    <div className="mb-4 space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Cari paket try out..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-11 w-full rounded-xl border bg-background pl-9 pr-9 text-sm outline-none ring-primary focus:ring-2"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Category pills */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => navigate(searchValue, "", currentSort)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            currentCategory === ""
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(searchValue, cat.slug, currentSort)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              currentCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort pills */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => navigate(searchValue, currentCategory, opt.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              currentSort === opt.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
