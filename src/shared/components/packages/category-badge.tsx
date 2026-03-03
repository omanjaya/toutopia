import { getCategoryTheme } from "@/shared/lib/category-colors";
import { cn } from "@/shared/lib/utils";

interface CategoryBadgeProps {
  name: string;
  slug: string;
  size?: "sm" | "md";
}

export function CategoryBadge({
  name,
  slug,
  size = "md",
}: CategoryBadgeProps): React.ReactElement {
  const theme = getCategoryTheme(slug);
  const Icon = theme.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        theme.bg,
        theme.text,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={1.5} />
      {name}
    </span>
  );
}
