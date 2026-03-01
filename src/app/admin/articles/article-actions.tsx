"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  Globe,
  EyeOff,
  Archive,
  Eye,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface ArticleActionsProps {
  articleId: string;
  articleSlug: string;
  status: string;
}

export function ArticleActions({
  articleId,
  articleSlug,
  status,
}: ArticleActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleStatusChange(
    newStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  ) {
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const label =
          newStatus === "PUBLISHED"
            ? "Artikel dipublikasikan"
            : newStatus === "ARCHIVED"
              ? "Artikel diarsipkan"
              : "Artikel dikembalikan ke draft";
        toast.success(label);
        startTransition(() => router.refresh());
      } else {
        toast.error("Gagal mengubah status artikel");
      }
    } catch {
      toast.error("Gagal mengubah status artikel");
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Artikel dihapus");
        startTransition(() => router.refresh());
      } else {
        toast.error("Gagal menghapus artikel");
      }
    } catch {
      toast.error("Gagal menghapus artikel");
    }
  }

  const isPublished = status === "PUBLISHED";
  const isArchived = status === "ARCHIVED";

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 px-2.5 text-xs"
          onClick={() => router.push(`/admin/articles/${articleId}`)}
          disabled={isPending}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 px-2.5 text-xs"
          asChild
        >
          <a
            href={`/admin/articles/preview/${articleSlug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={isPending}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Aksi lainnya</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {isPublished ? (
              <DropdownMenuItem onClick={() => handleStatusChange("DRAFT")}>
                <EyeOff className="mr-2 h-4 w-4" />
                Jadikan Draft
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleStatusChange("PUBLISHED")}>
                <Globe className="mr-2 h-4 w-4" />
                Publikasikan
              </DropdownMenuItem>
            )}
            {!isArchived && (
              <DropdownMenuItem onClick={() => handleStatusChange("ARCHIVED")}>
                <Archive className="mr-2 h-4 w-4" />
                Arsipkan
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Artikel akan dihapus secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
