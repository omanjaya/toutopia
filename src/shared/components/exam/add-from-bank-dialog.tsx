"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

/* ── Types ── */

interface Question {
  id: string;
  content: string;
  difficulty: Difficulty;
  type: QuestionType;
  topic?: {
    name: string;
  } | null;
}

interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

type Difficulty =
  | "VERY_EASY"
  | "EASY"
  | "MEDIUM"
  | "HARD"
  | "VERY_HARD"
  | "ALL";

type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY"
  | "ALL";

export interface AddFromBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  sectionId: string;
  sectionTitle: string;
  subjectId: string;
  currentQuestionIds: string[];
  capacity: number;
  onSuccess: (added: number) => void;
}

/* ── Constants ── */

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "ALL", label: "Semua Kesulitan" },
  { value: "VERY_EASY", label: "Sangat Mudah" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
  { value: "VERY_HARD", label: "Sangat Sulit" },
];

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "ALL", label: "Semua Tipe" },
  { value: "MULTIPLE_CHOICE", label: "Pilihan Ganda" },
  { value: "TRUE_FALSE", label: "Benar/Salah" },
  { value: "SHORT_ANSWER", label: "Jawaban Singkat" },
  { value: "ESSAY", label: "Esai" },
];

const PAGE_SIZE = 10;

/* ── Helpers ── */

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").slice(0, 80);
}

function difficultyLabel(d: Difficulty): string {
  return DIFFICULTY_OPTIONS.find((o) => o.value === d)?.label ?? d;
}

function difficultyBadgeClass(d: Difficulty): string {
  switch (d) {
    case "VERY_EASY":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "EASY":
      return "bg-green-50 text-green-700 border-green-200";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "HARD":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "VERY_HARD":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function typeLabel(t: QuestionType): string {
  return TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

/* ── Sub-components ── */

function RowCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "h-4 w-4 shrink-0 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background"
      )}
    >
      {checked && (
        <svg
          viewBox="0 0 10 10"
          className="h-full w-full fill-none stroke-white stroke-[1.5]"
        >
          <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="w-10">
            <Skeleton className="h-4 w-4 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-full max-w-xs" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/* ── Main Component ── */

export function AddFromBankDialog({
  open,
  onOpenChange,
  packageId,
  sectionId,
  sectionTitle,
  subjectId,
  currentQuestionIds,
  capacity,
  onSuccess,
}: AddFromBankDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    totalPages: 1,
    total: 0,
    perPage: PAGE_SIZE,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>("ALL");
  const [typeFilter, setTypeFilter] = useState<QuestionType>("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Fetch questions */
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "APPROVED",
        page: String(page),
        perPage: String(PAGE_SIZE),
        subjectId,
      });
      if (search.trim()) params.set("q", search.trim());
      if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const json = (await res.json()) as {
        success: boolean;
        data?: {
          questions: Question[];
          meta: PaginationMeta;
        };
        error?: { message: string };
      };

      if (!res.ok || !json.success) {
        toast.error(json.error?.message ?? "Gagal memuat soal dari bank");
        return;
      }

      const excludeSet = new Set(currentQuestionIds);
      const filtered = (json.data?.questions ?? []).filter(
        (q) => !excludeSet.has(q.id)
      );

      setQuestions(filtered);
      setMeta(
        json.data?.meta ?? { page: 1, totalPages: 1, total: 0, perPage: PAGE_SIZE }
      );
    } catch {
      toast.error("Terjadi kesalahan saat memuat soal");
    } finally {
      setLoading(false);
    }
  }, [page, search, difficultyFilter, typeFilter, subjectId, currentQuestionIds]);

  /* Re-fetch when filters or page change */
  useEffect(() => {
    if (!open) return;
    void fetchQuestions();
  }, [open, fetchQuestions]);

  /* Reset state when dialog closes */
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setSearch("");
      setDifficultyFilter("ALL");
      setTypeFilter("ALL");
      setPage(1);
      setQuestions([]);
    }
  }, [open]);

  /* Reset page when filters change */
  useEffect(() => {
    setPage(1);
  }, [search, difficultyFilter, typeFilter]);

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    const pageIds = questions.map((q) => q.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedIds.size === 0 || selectedIds.size > capacity) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/packages/${packageId}/sections/${sectionId}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionIds: [...selectedIds] }),
        }
      );

      const json = (await res.json()) as {
        success: boolean;
        data?: { added: number };
        error?: { message: string };
      };

      if (!res.ok || !json.success) {
        toast.error(json.error?.message ?? "Gagal menambahkan soal");
        return;
      }

      const added = json.data?.added ?? selectedIds.size;
      toast.success(`${added} soal berhasil ditambahkan ke seksi`);
      onSuccess(added);
      onOpenChange(false);
    } catch {
      toast.error("Terjadi kesalahan saat menambahkan soal");
    } finally {
      setSubmitting(false);
    }
  }

  const pageIds = questions.map((q) => q.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));
  const overCapacity = selectedIds.size > capacity;
  const canSubmit =
    selectedIds.size > 0 && !overCapacity && !submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Tambah Soal dari Bank Soal
          </DialogTitle>
          <DialogDescription>
            Pilih soal untuk seksi{" "}
            <span className="font-medium text-foreground">{sectionTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 py-3 border-b bg-muted/30 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari soal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          <Select
            value={difficultyFilter}
            onValueChange={(v) => setDifficultyFilter(v as Difficulty)}
          >
            <SelectTrigger className="h-8 w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as QuestionType)}
          >
            <SelectTrigger className="h-8 w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection status bar */}
        <div className="px-6 py-2 border-b flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Soal terpilih:</span>
            <Badge
              className={cn(
                "text-xs",
                overCapacity
                  ? "bg-red-50 text-red-700 border-red-200"
                  : selectedIds.size > 0
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {selectedIds.size}
            </Badge>
            {overCapacity && (
              <span className="text-red-600 text-xs">
                Melebihi kapasitas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Kapasitas:</span>
            <Badge variant="outline" className="text-xs">
              {capacity} soal
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <RowCheckbox
                    checked={allPageSelected}
                    onToggle={toggleAll}
                  />
                </TableHead>
                <TableHead className="min-w-0">Soal</TableHead>
                <TableHead className="w-36">Topik</TableHead>
                <TableHead className="w-28">Kesulitan</TableHead>
                <TableHead className="w-36">Tipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows />
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-8 w-8 opacity-40" />
                      <p className="text-sm">Tidak ada soal yang ditemukan</p>
                      {(search || difficultyFilter !== "ALL" || typeFilter !== "ALL") && (
                        <p className="text-xs">Coba ubah filter pencarian</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => {
                  const isSelected = selectedIds.has(q.id);
                  return (
                    <TableRow
                      key={q.id}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-blue-50/50 hover:bg-blue-50/70"
                      )}
                      onClick={() => toggleRow(q.id)}
                    >
                      <TableCell className="w-10">
                        <RowCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRow(q.id)}
                        />
                      </TableCell>
                      <TableCell className="min-w-0">
                        <p
                          className={cn(
                            "text-sm truncate max-w-xs",
                            isSelected ? "font-medium" : ""
                          )}
                          title={stripHtml(q.content)}
                        >
                          {stripHtml(q.content) || (
                            <span className="italic text-muted-foreground">
                              (konten gambar/formula)
                            </span>
                          )}
                          {q.content.replace(/<[^>]*>/g, "").length > 80 && "..."}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground truncate block max-w-[8rem]">
                          {q.topic?.name ?? (
                            <span className="italic">—</span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs whitespace-nowrap",
                            difficultyBadgeClass(q.difficulty)
                          )}
                        >
                          {difficultyLabel(q.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {typeLabel(q.type)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="px-6 py-2 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground text-xs">
              {meta.total} soal ditemukan
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                // Show pages around current page
                let pageNum: number;
                if (meta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={page >= meta.totalPages || loading}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {submitting
              ? "Menambahkan..."
              : selectedIds.size > 0
              ? `Tambah ${selectedIds.size} Soal Terpilih`
              : "Tambah Soal Terpilih"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
