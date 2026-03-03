import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

interface PriceDisplayProps {
  price: number;
  discountPrice: number | null;
  isFree: boolean;
  size?: "sm" | "lg";
}

export function PriceDisplay({
  price,
  discountPrice,
  isFree,
  size = "sm",
}: PriceDisplayProps): React.ReactElement {
  if (isFree) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-emerald-50 font-semibold text-emerald-700",
          size === "sm" ? "px-3 py-0.5 text-sm" : "px-4 py-1 text-lg",
        )}
      >
        Gratis
      </span>
    );
  }

  if (discountPrice !== null) {
    const pct = Math.round(((price - discountPrice) / price) * 100);
    return (
      <div className={cn("flex items-baseline gap-2", size === "lg" && "flex-wrap")}>
        <span className={cn("font-bold", size === "sm" ? "text-sm" : "text-2xl")}>
          {formatCurrency(discountPrice)}
        </span>
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {formatCurrency(price)}
        </span>
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
          -{pct}%
        </span>
      </div>
    );
  }

  return (
    <span className={cn("font-bold", size === "sm" ? "text-sm" : "text-2xl")}>
      {formatCurrency(price)}
    </span>
  );
}
