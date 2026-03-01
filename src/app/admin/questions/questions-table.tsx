"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Eye,
  CheckSquare,
  XSquare,
  Trash2,
  X,
  FileText,
} from "lucide-react";
import { truncate } from "@/shared/lib/utils";

interface QuestionTopic {
  subject: {
    subCategory: {
      category: { name: string };
    };
  };
}

export interface QuestionRow {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  status: string;
  topic: QuestionTopic;
}

interface QuestionsTableProps {
  questions: QuestionRow[];
  hasActiveFilter?: boolean;
}

const statusBadgeClass: Record<string, string> = {
  APPROVED: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  PENDING_REVIEW: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
  DRAFT: "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400",
  REJECTED: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
};

const statusLabel: Record<string, string> = {
  APPROVED: "Disetujui",
  PENDING_REVIEW: "Menunggu Review",
  DRAFT: "Draft",
  REJECTED: "Ditolak",
};

const difficultyLabel: Record<string, string> = {
  VERY_EASY: "Sangat Mudah",
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HARD: "Sulit",
  VERY_HARD: "Sangat Sulit",
};

const difficultyBadgeClass: Record<string, string> = {
  VERY_EASY: "bg-sky-500/10 text-sky-700 border-sky-200",
  EASY: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-500/10 text-amber-700 border-amber-200",
  HARD: "bg-orange-500/10 text-orange-700 border-orange-200",
  VERY_HARD: "bg-red-500/10 text-red-700 border-red-200",
};

export function QuestionsTable({ questions, hasActiveFilter = false }: QuestionsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"APPROVE" | "REJECT" | "DELETE" | null>(null);

  const allSelected = questions.length > 0 && selectedIds.size === questions.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < questions.length;

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function executeBulkAction(action: "APPROVE" | "REJECT" | "DELETE", reason?: string) {
    const ids = [...selectedIds];

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/questions/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, questionIds: ids, reason }),
        });

        const json = await res.json() as { success: boolean; data?: { affected: number }; error?: { message: string } };

        if (!res.ok || !json.success) {
          toast.error(json.error?.message ?? "Gagal menjalankan aksi");
          return;
        }

        const affected = json.data?.affected ?? ids.length;
        const actionLabel =
          action === "APPROVE" ? "disetujui" :
          action === "REJECT" ? "ditolak" :
          "dihapus";

        toast.success(`${affected} soal berhasil ${actionLabel}`);
        clearSelection();
        router.refresh();
      } catch {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    });
  }

  function handleBulkClick(action: "APPROVE" | "REJECT" | "DELETE") {
    if (action === "DELETE") {
      setPendingAction("DELETE");
      setDeleteDialogOpen(true);
    } else {
      void executeBulkAction(action);
    }
  }

  function confirmDelete() {
    setDeleteDialogOpen(false);
    setPendingAction(null);
    void executeBulkAction("DELETE");
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => toggleAll(v === true)}
                  aria-label="Pilih semua soal"
                />
              </TableHead>
              <TableHead className="w-[38%]">Soal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Kesulitan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => {
              const isSelected = selectedIds.has(question.id);
              return (
                <TableRow
                  key={question.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={isSelected ? "bg-muted/40" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(v) => toggleOne(question.id, v === true)}
                      aria-label={`Pilih soal ${question.id}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    <Link
                      href={`/admin/questions/${question.id}`}
                      className="hover:underline"
                    >
                      {truncate(question.content.replace(/<[^>]*>/g, ""), 80)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {question.topic.subject.subCategory.category.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={difficultyBadgeClass[question.difficulty] ?? ""}
                    >
                      {difficultyLabel[question.difficulty] ?? question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {question.type.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusBadgeClass[question.status] ?? ""}
                    >
                      {statusLabel[question.status] ?? question.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/questions/${question.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {hasActiveFilter
                        ? "Tidak ada soal yang sesuai filter"
                        : "Belum ada soal"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-background px-4 py-2.5 shadow-lg">
          <span className="text-sm font-medium text-muted-foreground">
            {selectedIds.size} soal dipilih
          </span>

          <div className="h-4 w-px bg-border" />

          <Button
            size="sm"
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            disabled={isPending}
            onClick={() => handleBulkClick("APPROVE")}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Setujui
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
            disabled={isPending}
            onClick={() => handleBulkClick("REJECT")}
          >
            <XSquare className="h-3.5 w-3.5" />
            Tolak
          </Button>

          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => handleBulkClick("DELETE")}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </Button>

          <div className="h-4 w-px bg-border" />

          <Button
            size="icon-sm"
            variant="ghost"
            onClick={clearSelection}
            aria-label="Batalkan pilihan"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {selectedIds.size} Soal?</DialogTitle>
            <DialogDescription>
              Soal yang sedang digunakan dalam paket ujian akan dinonaktifkan
              (soft-delete). Soal yang tidak digunakan akan dihapus permanen.
              Tindakan ini tidak dapat dibatalkan sepenuhnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPendingAction(null);
              }}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
