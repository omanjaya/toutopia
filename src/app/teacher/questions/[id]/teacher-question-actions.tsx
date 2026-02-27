"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import Link from "next/link";

interface TeacherQuestionActionsProps {
  questionId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function TeacherQuestionActions({ questionId, canEdit, canDelete }: TeacherQuestionActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/teacher/questions/${questionId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Soal berhasil dihapus");
        router.push("/teacher/questions");
        router.refresh();
      } else {
        toast.error(data.error?.message ?? "Gagal menghapus soal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button variant="outline" asChild>
          <Link href={`/teacher/questions/${questionId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Soal
          </Link>
        </Button>
      )}
      {canDelete && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Hapus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Soal?</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak dapat dibatalkan. Soal akan dihapus secara permanen.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
