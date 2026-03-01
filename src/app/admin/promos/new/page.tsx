import type { Metadata } from "next";
import Link from "next/link";
import { Tag, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PromoForm } from "../promo-form";

export const metadata: Metadata = {
  title: "Buat Promo Baru",
};

export default function NewPromoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/admin/promos">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Buat Promo Baru</h2>
          <p className="text-sm text-muted-foreground">Tambahkan kode promo untuk pengguna</p>
        </div>
      </div>

      <PromoForm mode="create" />
    </div>
  );
}
