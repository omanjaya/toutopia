"use client";

import { useMemo } from "react";
import katex from "katex";
import { sanitizeHtml } from "@/shared/lib/sanitize";

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className }: MathRendererProps) {
  const rendered = useMemo(() => {
    // Split content into math and non-math segments, sanitize non-math parts
    const parts: string[] = [];
    let lastIndex = 0;
    const mathRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
    let match: RegExpExecArray | null;

    while ((match = mathRegex.exec(content)) !== null) {
      // Sanitize the non-math text before this match
      if (match.index > lastIndex) {
        parts.push(sanitizeHtml(content.slice(lastIndex, match.index)));
      }

      // Render the math portion (KaTeX output is safe)
      const block = match[1] as string | undefined;
      const inline = match[2] as string | undefined;
      const tex = block ?? inline ?? "";
      const displayMode = !!block;
      try {
        parts.push(katex.renderToString(tex, { displayMode, throwOnError: false }));
      } catch {
        parts.push(tex);
      }

      lastIndex = match.index + match[0].length;
    }

    // Sanitize any remaining non-math text after the last match
    if (lastIndex < content.length) {
      parts.push(sanitizeHtml(content.slice(lastIndex)));
    }

    return parts.join("");
  }, [content]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
