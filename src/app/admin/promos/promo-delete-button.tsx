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
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 text-destructive" />
      )}
    </Button>
  );
}
