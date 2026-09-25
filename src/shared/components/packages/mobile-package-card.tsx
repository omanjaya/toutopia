import type React from "react";
import Link from "next/link";
import { FileText, Package, Users } from "lucide-react";
import { cn, formatCurrency } from "@/shared/lib/utils";
import { getCategoryTheme } from "@/shared/lib/category-colors";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

interface MobilePackageCardProps {
  slug: string;
  title: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  isFree: boolean;
  totalQuestions: number;
  durationMinutes: number;
  participantCount: number;
  categoryName: string;
  categorySlug: string;
}

export function MobilePackageCard({
  slug,
  title,
  description,
  price,
  discountPrice,
  isFree,
  totalQuestions,
  durationMinutes,
  participantCount,
  categoryName,
  categorySlug,
}: MobilePackageCardProps): React.ReactElement {
  const theme = getCategoryTheme(categorySlug);

  return (
    <Link href={`/packages/${slug}`}>
      <div
        className={cn(
          cardCls,
          "flex flex-col gap-3 p-4 transition-transform active:scale-[0.98]",
        )}
      >
        {/* Top row: category badge + participant count */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              theme.bg,
              theme.text,
            )}
          >
            {categoryName}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" strokeWidth={1.5} />
            {participantCount.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Meta row: soal + durasi */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            {totalQuestions} soal
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" strokeWidth={1.5} />
            {durationMinutes} menit
          </span>
        </div>

        {/* Price */}
        <div>
          {isFree ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-0.5 text-sm font-semibold text-emerald-700">
              Gratis
            </span>
          ) : discountPrice !== null ? (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold">
                {formatCurrency(discountPrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                -{Math.round(((price - discountPrice) / price) * 100)}%
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold">{formatCurrency(price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
