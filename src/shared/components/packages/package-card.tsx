import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getCategoryTheme } from "@/shared/lib/category-colors";
import { cn } from "@/shared/lib/utils";
import { CategoryBadge } from "./category-badge";
import { PriceDisplay } from "./price-display";
import { PackageStatsRow } from "./package-stats-row";

interface PackageCardProps {
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

export function PackageCard({
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
}: PackageCardProps): React.ReactElement {
  const theme = getCategoryTheme(categorySlug);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border-l-4 bg-card shadow-sm ring-1 ring-black/[0.05] transition-shadow hover:shadow-md",
        isFree ? "border-emerald-500" : theme.borderAccent,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge name={categoryName} slug={categorySlug} size="sm" />
          <PriceDisplay
            price={price}
            discountPrice={discountPrice}
            isFree={isFree}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold leading-snug tracking-tight line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <PackageStatsRow
          totalQuestions={totalQuestions}
          durationMinutes={durationMinutes}
          participantCount={participantCount}
        />
      </div>

      <div className="border-t px-5 py-4">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/packages/${slug}`}>
            Lihat Detail
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
