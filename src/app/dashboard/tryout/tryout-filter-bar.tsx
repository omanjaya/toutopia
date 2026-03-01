"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface TryoutFilterBarProps {
  categories: Category[];
  currentQ: string;
  currentCategory: string;
  currentSort: string;
}

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "populer", label: "Populer" },
  { value: "gratis", label: "Gratis Dulu" },
  { value: "berbayar", label: "Berbayar" },
] as const;

export function TryoutFilterBar({
  categories,
  currentQ,
  currentCategory,
  currentSort,
}: TryoutFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateParam("q", e.target.value);
    },
    [updateParam],
  );

  const handleCategoryClick = useCallback(
    (slug: string) => {
      updateParam("category", slug === "semua" ? "" : slug);
    },
    [updateParam],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateParam("sort", value === "terbaru" ? "" : value);
    },
    [updateParam],
  );

  const activeCategory = currentCategory || "semua";

  return (
    <div className={cn("space-y-4", isPending && "opacity-60 pointer-events-none")}>
      {/* Search + Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari paket try out..."
            defaultValue={currentQ}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select
            value={currentSort || "terbaru"}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleCategoryClick("semua")}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            activeCategory === "semua"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary",
          )}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
