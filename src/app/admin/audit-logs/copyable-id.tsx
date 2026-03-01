"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyableIdProps {
  id: string;
}

export function CopyableId({ id }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors"
      title={id}
    >
      <span>{id.slice(0, 8)}...</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );
}
