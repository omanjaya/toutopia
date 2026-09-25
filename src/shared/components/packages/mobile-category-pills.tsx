import type React from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface Category {
  name: string;
  slug: string;
}

interface MobileCategoryPillsProps {
  categories: Category[];
  activeCategory: string;
  sort: string;
}

const sortOptions = [
  { label: "Terbaru", value: "" },
  { label: "Populer", value: "populer" },
  { label: "Harga Terendah", value: "harga-asc" },
  { label: "Harga Tertinggi", value: "harga-desc" },
];

export function MobileCategoryPills({
  categories,
  activeCategory,
  sort,
}: MobileCategoryPillsProps): React.ReactElement {
  return (
    <div className="px-4">
      {/* Category pills */}
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/packages"
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeCategory === ""
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Semua
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/packages?category=${cat.slug}${sort ? `&sort=${sort}` : ""}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Sort pills */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sortOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/packages?${activeCategory ? `category=${activeCategory}&` : ""}sort=${opt.value}`}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              sort === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
