"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

export function BookmarkActions({ bookmarkId }: { bookmarkId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    if (!confirm("Hapus bookmark ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRemove}
      disabled={loading}
      className="shrink-0"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      )}
    </Button>
  );
}
