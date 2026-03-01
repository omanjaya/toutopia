"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, GraduationCap } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { formatCurrency } from "@/shared/lib/utils";
import { TeacherActions } from "./teacher-actions";

interface Teacher {
  id: string;
  isVerified: boolean;
  education: string | null;
  specialization: string[];
  totalEarnings: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface TeachersTableProps {
  teachers: Teacher[];
  hasFilter: boolean;
}

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

export function TeachersTable({ teachers, hasFilter }: TeachersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  // Only pending teachers are selectable for bulk actions
  const pendingTeachers = teachers.filter((t) => !t.isVerified);
  const allPendingSelected =
    pendingTeachers.length > 0 &&
    pendingTeachers.every((t) => selected.has(t.id));
  const somePendingSelected = pendingTeachers.some((t) => selected.has(t.id));

  function toggleAll() {
    if (allPendingSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingTeachers.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleBulkApprove() {
    const ids = Array.from(selected);
    startTransition(async () => {
      let successCount = 0;
      for (const id of ids) {
        const res = await fetch(`/api/admin/teachers/${id}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "APPROVE" }),
        });
        if (res.ok) successCount++;
      }
      if (successCount > 0) {
        toast.success(`${successCount} pengajar berhasil diverifikasi`);
      }
      if (successCount < ids.length) {
        toast.error(`${ids.length - successCount} pengajar gagal diverifikasi`);
      }
      clearSelection();
      router.refresh();
    });
  }

  async function handleBulkReject() {
    const ids = Array.from(selected);
    startTransition(async () => {
      let successCount = 0;
      for (const id of ids) {
        const res = await fetch(`/api/admin/teachers/${id}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "REJECT",
            reason: bulkRejectReason || undefined,
          }),
        });
        if (res.ok) successCount++;
      }
      if (successCount > 0) {
        toast.success(`${successCount} pengajuan berhasil ditolak`);
      }
      if (successCount < ids.length) {
        toast.error(`${ids.length - successCount} pengajuan gagal ditolak`);
      }
      setBulkRejectDialogOpen(false);
      setBulkRejectReason("");
      clearSelection();
      router.refresh();
    });
  }

  const selectedCount = selected.size;

  return (
    <>
      {/* Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-5">
                {pendingTeachers.length > 0 && (
                  <Checkbox
                    checked={allPendingSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Pilih semua pending"
                    className={
                      somePendingSelected && !allPendingSelected
                        ? "data-[state=unchecked]:bg-muted"
                        : ""
                    }
                  />
                )}
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Pendidikan</TableHead>
              <TableHead>Spesialisasi</TableHead>
              <TableHead>Penghasilan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[160px] pr-5">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((t) => (
              <TableRow
                key={t.id}
                className={`hover:bg-muted/40 ${selected.has(t.id) ? "bg-primary/5" : ""}`}
              >
                <TableCell className="pl-5">
                  {!t.isVerified && (
                    <Checkbox
                      checked={selected.has(t.id)}
                      onCheckedChange={() => toggleOne(t.id)}
                      aria-label={`Pilih ${t.user.name ?? t.user.email}`}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{t.user.name}</p>
                    <p className="text-xs text-muted-foreground">{t.user.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.education ?? <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.specialization.length > 0 ? (
                    <>
                      {t.specialization.slice(0, 2).join(", ")}
                      {t.specialization.length > 2 && (
                        <span className="text-muted-foreground/60">
                          {" "}
                          +{t.specialization.length - 2}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm font-medium tabular-nums">
                  {formatCurrency(t.totalEarnings)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        t.isVerified ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <Badge
                      variant="outline"
                      className={
                        t.isVerified
                          ? "border-emerald-200 bg-emerald-500/10 text-xs text-emerald-700"
                          : "border-amber-200 bg-amber-500/10 text-xs text-amber-700"
                      }
                    >
                      {t.isVerified ? "Terverifikasi" : "Menunggu"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="pr-5">
                  <TeacherActions
                    teacherId={t.id}
                    teacherName={t.user.name ?? t.user.email ?? t.id}
                    isVerified={t.isVerified}
                  />
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <GraduationCap className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {hasFilter
                        ? "Tidak ada pengajar yang sesuai filter"
                        : "Belum ada pendaftaran pengajar"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating action bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3 shadow-2xl ring-1 ring-white/10">
            <span className="text-sm font-medium text-white">
              {selectedCount} pengajar dipilih
            </span>
            <div className="h-4 w-px bg-white/20" />
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-emerald-500 px-3 text-xs font-medium text-white hover:bg-emerald-600"
              onClick={handleBulkApprove}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Verifikasi Semua
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-red-500 px-3 text-xs font-medium text-white hover:bg-red-600"
              onClick={() => setBulkRejectDialogOpen(true)}
              disabled={isPending}
            >
              <XCircle className="h-3.5 w-3.5" />
              Tolak Semua
            </Button>
            <button
              onClick={clearSelection}
              disabled={isPending}
              className="text-xs text-white/60 hover:text-white/90 disabled:opacity-40"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Bulk reject dialog */}
      <Dialog open={bulkRejectDialogOpen} onOpenChange={setBulkRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak {selectedCount} Pengajuan Pengajar</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menolak dan menghapus {selectedCount} profil pengajar
              yang dipilih. Mereka dapat mendaftar ulang.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-reason">Alasan penolakan (opsional)</Label>
            <Textarea
              id="bulk-reason"
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="Contoh: Dokumen tidak lengkap, spesialisasi tidak sesuai..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkRejectDialogOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkReject}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Ya, Tolak {selectedCount} Pengajar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
