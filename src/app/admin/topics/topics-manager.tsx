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
  Tag,
  Search,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface TopicItem {
  id: string;
  name: string;
  order: number;
  _count: { questions: number };
}

interface SubjectWithTopics {
  id: string;
  name: string;
  order: number;
  subCategory: {
    name: string;
    category: { name: string };
  };
  topics: TopicItem[];
}

interface TopicsManagerProps {
  subjects: SubjectWithTopics[];
}

interface AddDialogState {
  open: boolean;
  subjectId: string;
  subjectName: string;
}

interface EditDialogState {
  open: boolean;
  topicId: string;
  currentName: string;
}

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export function TopicsManager({ subjects }: TopicsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    () => new Set(subjects.map((s) => s.id))
  );

  const [addDialog, setAddDialog] = useState<AddDialogState>({
    open: false,
    subjectId: "",
    subjectName: "",
  });
  const [addName, setAddName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    topicId: "",
    currentName: "",
  });
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const filteredSubjects = search.trim()
    ? subjects.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase().trim())
      )
    : subjects;

  function toggleSubject(subjectId: string) {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }

  function openAddDialog(subjectId: string, subjectName: string) {
    setAddName("");
    setAddDialog({ open: true, subjectId, subjectName });
  }

  function openEditDialog(topicId: string, currentName: string) {
    setEditName(currentName);
    setEditDialog({ open: true, topicId, currentName });
  }

  async function handleAddTopic() {
    if (!addName.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          subjectId: addDialog.subjectId,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: { message: string };
      };
      if (!json.success) {
        toast.error(json.error?.message ?? "Gagal menambah topik");
        return;
      }
      toast.success("Topik berhasil ditambahkan");
      setAddDialog({ open: false, subjectId: "", subjectName: "" });
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEditTopic() {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/topics/${editDialog.topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: { message: string };
      };
      if (!json.success) {
        toast.error(json.error?.message ?? "Gagal memperbarui topik");
        return;
      }
      toast.success("Topik berhasil diperbarui");
      setEditDialog({ open: false, topicId: "", currentName: "" });
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeleteTopic(topicId: string, topicName: string) {
    if (
      !confirm(
        `Hapus topik "${topicName}"? Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;

    setDeleteLoadingId(topicId);
    try {
      const res = await fetch(`/api/admin/topics/${topicId}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: { message: string };
      };
      if (!json.success) {
        toast.error(json.error?.message ?? "Gagal menghapus topik");
        return;
      }
      toast.success("Topik berhasil dihapus");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  if (subjects.length === 0) {
    return (
      <div
        className={`${cardCls} flex flex-col items-center justify-center gap-3 p-16 text-center`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Tag className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Belum ada mata pelajaran. Tambah mata pelajaran terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className={`${cardCls} p-4`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Subject list */}
      <div className="space-y-4">
        {filteredSubjects.length === 0 ? (
          <div
            className={`${cardCls} flex flex-col items-center justify-center gap-2 p-12 text-center`}
          >
            <p className="text-sm text-muted-foreground">
              Tidak ada mata pelajaran yang cocok dengan pencarian.
            </p>
          </div>
        ) : (
          filteredSubjects.map((subject) => {
            const isExpanded = expandedSubjects.has(subject.id);

            return (
              <div key={subject.id} className={cardCls}>
                {/* Subject header */}
                <button
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight">
                      {subject.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {subject.subCategory.category.name}
                      {" › "}
                      {subject.subCategory.name}
                      {" · "}
                      {subject.topics.length} topik
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {/* Topics list */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-5 py-4 space-y-3">
                    {/* Add button row */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Daftar Topik
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() =>
                          openAddDialog(subject.id, subject.name)
                        }
                        disabled={isPending}
                      >
                        <Plus className="h-3 w-3" />
                        Tambah Topik
                      </Button>
                    </div>

                    {subject.topics.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/70 py-6 text-center">
                        <p className="text-xs text-muted-foreground">
                          Belum ada topik. Tambah topik pertama.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border/50 divide-y divide-border/50">
                        {subject.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs tabular-nums w-5 shrink-0 text-muted-foreground text-right">
                                {topic.order + 1}
                              </span>
                              <span className="text-sm font-medium truncate">
                                {topic.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs px-1.5 py-0"
                              >
                                {topic._count.questions} soal
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() =>
                                  openEditDialog(topic.id, topic.name)
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
                                  handleDeleteTopic(topic.id, topic.name)
                                }
                                disabled={
                                  deleteLoadingId === topic.id || isPending
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
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Topic Dialog */}
      <Dialog
        open={addDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setAddDialog({ open: false, subjectId: "", subjectName: "" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Topik</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-4 text-sm text-muted-foreground">
              Mata pelajaran:{" "}
              <span className="font-medium text-foreground">
                {addDialog.subjectName}
              </span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="add-topic-name">Nama Topik</Label>
              <Input
                id="add-topic-name"
                placeholder="Contoh: Limit Fungsi"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAddTopic();
                }}
                disabled={addLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setAddDialog({ open: false, subjectId: "", subjectName: "" })
              }
              disabled={addLoading}
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleAddTopic()}
              disabled={addLoading || !addName.trim()}
            >
              {addLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setEditDialog({ open: false, topicId: "", currentName: "" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Topik</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-topic-name">Nama Topik</Label>
              <Input
                id="edit-topic-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleEditTopic();
                }}
                disabled={editLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, topicId: "", currentName: "" })
              }
              disabled={editLoading}
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleEditTopic()}
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
