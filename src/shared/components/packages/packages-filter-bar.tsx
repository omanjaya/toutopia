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
import { getCategoryTheme } from "@/shared/lib/category-colors";
import { cn } from "@/shared/lib/utils";

interface Category {
  name: string;
  slug: string;
}

interface PackagesFilterBarProps {
  categories: Category[];
  currentQ: string;
  currentCategory: string;
  currentSort: string;
}

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "populer", label: "Populer" },
  { value: "harga-asc", label: "Harga: Rendah ke Tinggi" },
  { value: "harga-desc", label: "Harga: Tinggi ke Rendah" },
] as const;

export function PackagesFilterBar({
  categories,
  currentQ,
  currentCategory,
  currentSort,
}: PackagesFilterBarProps): React.ReactElement {
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
      updateParam("category", slug);
    },
    [updateParam],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateParam("sort", value === "terbaru" ? "" : value);
    },
    [updateParam],
  );

  const activeCategory = currentCategory || "";

  return (
    <div className={cn("space-y-4", isPending && "opacity-60 pointer-events-none")}>
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
            <SelectTrigger className="w-[200px]">
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

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleCategoryClick("")}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            activeCategory === ""
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
          )}
        >
          Semua
        </button>
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat.slug);
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                isActive
                  ? cn(theme.solid, theme.borderAccent)
                  : cn("bg-background border-border hover:text-foreground", theme.text, `hover:${theme.borderAccent}`),
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
