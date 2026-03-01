"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PromoToggleButtonProps {
  promoId: string;
  isActive: boolean;
}

export function PromoToggleButton({ promoId, isActive }: PromoToggleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promos/${promoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) {
        toast.error("Gagal mengubah status");
        return;
      }
      toast.success(isActive ? "Promo dinonaktifkan" : "Promo diaktifkan");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${isActive ? "text-emerald-600 hover:text-emerald-700" : "text-muted-foreground hover:text-foreground"}`}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isActive ? (
        <ToggleRight className="h-4 w-4" />
      ) : (
        <ToggleLeft className="h-4 w-4" />
      )}
    </Button>
  );
}
