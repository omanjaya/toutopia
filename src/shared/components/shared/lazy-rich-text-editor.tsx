"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const RichTextEditor = dynamic(
  () =>
    import("./rich-text-editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

export { RichTextEditor as LazyRichTextEditor };
