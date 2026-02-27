"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface MobileShareButtonProps {
  url: string;
  title: string;
}

export function MobileShareButton({ url, title }: MobileShareButtonProps) {
  async function handleShare(): Promise<void> {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link berhasil disalin");
      } catch {
        toast.error("Gagal menyalin link");
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
      aria-label="Bagikan artikel"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
