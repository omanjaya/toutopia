"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface EbookActionsProps {
  ebookId: string;
}

export function EbookActions({ ebookId }: EbookActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Hapus ebook ini?")) return;

    try {
      const res = await fetch(`/api/admin/ebooks/${ebookId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Ebook dihapus");
        router.refresh();
      } else {
        toast.error("Gagal menghapus ebook");
      }
    } catch {
      toast.error("Gagal menghapus ebook");
    }
  }

  return (
    <div className="flex items-center gap-1 ml-4">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => router.push(`/admin/ebooks/${ebookId}`)}
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
