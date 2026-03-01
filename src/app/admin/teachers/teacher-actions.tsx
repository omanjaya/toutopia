"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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

interface TeacherActionsProps {
  teacherId: string;
  teacherName: string;
  isVerified: boolean;
}

export function TeacherActions({ teacherId, teacherName, isVerified }: TeacherActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function handleApprove() {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const result = await res.json() as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal memverifikasi");
        return;
      }
      toast.success(`${teacherName} berhasil diverifikasi`);
      router.refresh();
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: rejectReason || undefined }),
      });
      const result = await res.json() as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal menolak");
        return;
      }
      toast.success(`Pengajuan ${teacherName} ditolak`);
      setRejectDialogOpen(false);
      setRejectReason("");
      router.refresh();
    } finally {
      setIsRejecting(false);
    }
  }

  if (isVerified) {
    return <span className="text-xs text-muted-foreground">Sudah diverifikasi</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 border-emerald-200 bg-emerald-500/10 px-2.5 text-xs text-emerald-700 hover:bg-emerald-500/20 hover:text-emerald-800"
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
        >
          {isApproving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          Verifikasi
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 border-red-200 bg-red-500/10 px-2.5 text-xs text-red-700 hover:bg-red-500/20 hover:text-red-800"
          onClick={() => setRejectDialogOpen(true)}
          disabled={isApproving || isRejecting}
        >
          <XCircle className="h-3 w-3" />
          Tolak
        </Button>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan Pengajar</DialogTitle>
            <DialogDescription>
              Tolak pengajuan dari{" "}
              <span className="font-medium">{teacherName}</span>. Profil pengajar
              akan dihapus dan mereka dapat mendaftar ulang.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Alasan penolakan (opsional)</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Dokumen tidak lengkap, spesialisasi tidak sesuai..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isRejecting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Ya, Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
