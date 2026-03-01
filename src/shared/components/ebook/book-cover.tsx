"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";

interface BookCoverProps {
  src?: string | null;
  alt: string;
  /** Pixel width rendered — used for sizes hint */
  width?: number;
  priority?: boolean;
}

/**
 * A book cover with:
 * - Portrait 3:4 ratio
 * - Book spine shadow on the left edge
 * - Subtle 3D lift on hover (CSS perspective transform, no JS)
 */
export function BookCover({
  src,
  alt,
  width = 224,
  priority = false,
}: BookCoverProps) {
  return (
    <div
      className="
        group/cover relative aspect-[3/4] w-full cursor-default select-none
        [perspective:600px]
      "
    >
      {/* Outer wrapper — handles the 3D tilt + drop shadow */}
      <div
        className="
          relative h-full w-full overflow-hidden rounded-r-lg
          shadow-[4px_6px_24px_rgba(0,0,0,0.25)]
          transition-transform duration-300 ease-out
          group-hover/cover:[transform:rotateY(-8deg)_rotateX(2deg)_scale(1.02)]
          group-hover/cover:shadow-[8px_16px_40px_rgba(0,0,0,0.30)]
        "
        style={{ transformOrigin: "left center" }}
      >
        {/* Spine — left edge darker strip */}
        <div className="absolute inset-y-0 left-0 z-10 w-3 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Spine highlight line */}
        <div className="absolute inset-y-0 left-3 z-10 w-px bg-white/10" />

        {/* Cover image or placeholder */}
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={`${width}px`}
            priority={priority}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/20 via-primary/10 to-muted px-4">
            <BookOpen className="h-10 w-10 text-primary/40" />
            <p className="text-center text-xs font-medium leading-snug text-muted-foreground/60 line-clamp-4">
              {alt}
            </p>
          </div>
        )}

        {/* Top gloss overlay */}
        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-br from-white/10 via-transparent to-transparent
          "
        />
      </div>

      {/* Page thickness — right edge of cover */}
      <div
        className="
          absolute inset-y-1 -right-1.5 w-2.5 rounded-r-sm
          bg-gradient-to-l from-muted/80 to-muted/40
          shadow-sm
        "
      />
    </div>
  );
}
