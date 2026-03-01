"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface SubjectWithCount {
  id: string;
  name: string;
  slug: string;
  order: number;
  subCategoryId: string;
  createdAt: Date;
  _count: { topics: number };
}

interface SubCategoryWithSubjects {
  id: string;
  name: string;
  slug: string;
  order: number;
  categoryId: string;
  createdAt: Date;
  subjects: SubjectWithCount[];
}

interface CategoryWithSubCategories {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subCategories: SubCategoryWithSubjects[];
}

interface SubjectsTreeProps {
  categories: CategoryWithSubCategories[];
}

interface AddDialogState {
  open: boolean;
  subCategoryId: string;
  subCategoryName: string;
}

interface EditDialogState {
  open: boolean;
  subjectId: string;
  currentName: string;
}

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export function SubjectsTree({ categories }: SubjectsTreeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.id))
  );

  const [addDialog, setAddDialog] = useState<AddDialogState>({
    open: false,
    subCategoryId: "",
    subCategoryName: "",
  });
  const [addName, setAddName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    subjectId: "",
    currentName: "",
  });
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  function toggleCategory(categoryId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function openAddDialog(subCategoryId: string, subCategoryName: string) {
    setAddName("");
    setAddDialog({ open: true, subCategoryId, subCategoryName });
  }

  function openEditDialog(subjectId: string, currentName: string) {
    setEditName(currentName);
    setEditDialog({ open: true, subjectId, currentName });
  }

  async function handleAddSubject() {
    if (!addName.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          subCategoryId: addDialog.subCategoryId,
        }),
      });
      const json = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) {
        toast.error(json.error?.message ?? "Gagal menambah mata pelajaran");
        return;
      }
      toast.success("Mata pelajaran berhasil ditambahkan");
      setAddDialog({ open: false, subCategoryId: "", subCategoryName: "" });
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEditSubject() {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/subjects/${editDialog.subjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const json = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) {
        toast.error(json.error?.message ?? "Gagal memperbarui mata pelajaran");
        return;
      }
      toast.success("Mata pelajaran berhasil diperbarui");
      setEditDialog({ open: false, subjectId: "", currentName: "" });
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeleteSubject(subjectId: string, subjectName: string) {
    if (
      !confirm(
        `Hapus mata pelajaran "${subjectName}"? Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;

    setDeleteLoadingId(subjectId);
    try {
      const res = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) {
        toast.error(json.error?.message ?? "Gagal menghapus mata pelajaran");
        return;
      }
      toast.success("Mata pelajaran berhasil dihapus");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  if (categories.length === 0) {
    return (
      <div className={`${cardCls} flex flex-col items-center justify-center gap-3 p-16 text-center`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <BookOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Belum ada kategori ujian yang aktif
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const totalSubjects = category.subCategories.reduce(
            (acc, sub) => acc + sub.subjects.length,
            0
          );

          return (
            <div key={category.id} className={cardCls}>
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold leading-tight">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {category.subCategories.length} sub-kategori &middot;{" "}
                    {totalSubjects} mata pelajaran
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* SubCategories */}
              {isExpanded && (
                <div className="border-t border-border/50 px-5 py-3 space-y-5">
                  {category.subCategories.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Tidak ada sub-kategori
                    </p>
                  ) : (
                    category.subCategories.map((subCategory) => (
                      <div key={subCategory.id}>
                        {/* SubCategory Header */}
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                            <span className="text-sm font-semibold text-foreground">
                              {subCategory.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0"
                            >
                              {subCategory.subjects.length} mapel
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1.5 text-xs"
                            onClick={() =>
                              openAddDialog(subCategory.id, subCategory.name)
                            }
                          >
                            <Plus className="h-3 w-3" />
                            Tambah Mata Pelajaran
                          </Button>
                        </div>

                        {/* Subjects List */}
                        {subCategory.subjects.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border/70 py-5 text-center">
                            <p className="text-xs text-muted-foreground">
                              Belum ada mata pelajaran
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-border/50 divide-y divide-border/50">
                            {subCategory.subjects.map((subject) => (
                              <div
                                key={subject.id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-sm font-medium truncate">
                                    {subject.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 text-xs px-1.5 py-0"
                                  >
                                    {subject._count.topics} topik
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      openEditDialog(subject.id, subject.name)
                                    }
                                    disabled={isPending}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteSubject(
                                        subject.id,
                                        subject.name
                                      )
                                    }
                                    disabled={
                                      deleteLoadingId === subject.id ||
                                      isPending
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="sr-only">Hapus</span>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Subject Dialog */}
      <Dialog
        open={addDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setAddDialog({ open: false, subCategoryId: "", subCategoryName: "" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-4 text-sm text-muted-foreground">
              Sub-kategori:{" "}
              <span className="font-medium text-foreground">
                {addDialog.subCategoryName}
              </span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="add-subject-name">Nama Mata Pelajaran</Label>
              <Input
                id="add-subject-name"
                placeholder="Contoh: Matematika Dasar"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAddSubject();
                }}
                disabled={addLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setAddDialog({
                  open: false,
                  subCategoryId: "",
                  subCategoryName: "",
                })
              }
              disabled={addLoading}
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleAddSubject()}
              disabled={addLoading || !addName.trim()}
            >
              {addLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setEditDialog({ open: false, subjectId: "", currentName: "" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Mata Pelajaran</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-subject-name">Nama Mata Pelajaran</Label>
              <Input
                id="edit-subject-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleEditSubject();
                }}
                disabled={editLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, subjectId: "", currentName: "" })
              }
              disabled={editLoading}
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleEditSubject()}
              disabled={
                editLoading ||
                !editName.trim() ||
                editName.trim() === editDialog.currentName
              }
            >
              {editLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
