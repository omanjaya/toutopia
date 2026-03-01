"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ArticleActionsProps {
  articleId: string;
}

export function ArticleActions({ articleId }: ArticleActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Hapus artikel ini?")) return;

    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Artikel dihapus");
        router.refresh();
      } else {
        toast.error("Gagal menghapus artikel");
      }
    } catch {
      toast.error("Gagal menghapus artikel");
    }
  }

  return (
    <div className="flex items-center gap-1 ml-4">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => router.push(`/admin/articles/${articleId}`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleDelete}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
