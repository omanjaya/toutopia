"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MathRenderer = dynamic(
  () =>
    import("./math-renderer").then((mod) => ({
      default: mod.MathRenderer,
    })),
  {
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Memuat rumus...
      </div>
    ),
    ssr: false,
  }
);

export { MathRenderer as LazyMathRenderer };
