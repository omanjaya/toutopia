"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PromoDeleteButtonProps {
  promoId: string;
  promoCode: string;
  hasUsages: boolean;
}

export function PromoDeleteButton({
  promoId,
  promoCode,
  hasUsages,
}: PromoDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const action = hasUsages ? "menonaktifkan" : "menghapus";
    const confirmed = window.confirm(
      `Yakin ingin ${action} promo "${promoCode}"?`
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/promos/${promoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error?.message ?? "Gagal menghapus promo");
        return;
      }

      toast.success(
        hasUsages
          ? `Promo "${promoCode}" dinonaktifkan`
          : `Promo "${promoCode}" dihapus`
      );
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
