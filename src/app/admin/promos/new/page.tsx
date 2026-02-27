import type { Metadata } from "next";
import { PromoForm } from "../promo-form";

export const metadata: Metadata = {
  title: "Buat Promo Baru",
};

export default function NewPromoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Buat Promo Baru</h2>
        <p className="text-muted-foreground">
          Tambahkan kode promo baru untuk pengguna
        </p>
      </div>

      <PromoForm mode="create" />
    </div>
  );
}
