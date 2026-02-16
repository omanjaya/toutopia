"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className }: MathRendererProps) {
  const rendered = useMemo(() => {
    return content.replace(
      /\$\$(.*?)\$\$|\$(.*?)\$/g,
      (_match, block: string | undefined, inline: string | undefined) => {
        const tex = block ?? inline ?? "";
        const displayMode = !!block;
        try {
          return katex.renderToString(tex, { displayMode, throwOnError: false });
        } catch {
          return tex;
        }
      }
    );
  }, [content]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
