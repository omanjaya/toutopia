"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function BundleDeleteButton({ bundleId, bundleName }: { bundleId: string; bundleName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  async function handleDelete(): Promise<void> {
    if (!confirm(`Hapus bundle "${bundleName}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bundles/${bundleId}`, { method: "DELETE" });
      const result = await res.json() as { error?: { message?: string } };
      if (!res.ok) { toast.error(result.error?.message ?? "Gagal menghapus"); return; }
      toast.success(`Bundle "${bundleName}" dihapus`);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete} disabled={deleting}>
      {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}
