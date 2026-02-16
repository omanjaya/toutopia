"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface TeacherActionsProps {
  teacherId: string;
  isVerified: boolean;
}

export function TeacherActions({ teacherId, isVerified }: TeacherActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(action: "APPROVE" | "REJECT") {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/teachers/${teacherId}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Gagal memproses");
        return;
      }

      toast.success(
        action === "APPROVE"
          ? "Pengajar berhasil diverifikasi"
          : "Pengajuan ditolak"
      );
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerified) {
    return (
      <span className="text-xs text-muted-foreground">Sudah diverifikasi</span>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAction("APPROVE")}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAction("REJECT")}
        disabled={isLoading}
      >
        <XCircle className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
