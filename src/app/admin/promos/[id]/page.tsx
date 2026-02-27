import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { PromoForm } from "../promo-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Promo",
};

interface EditPromoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPromoPage({ params }: EditPromoPageProps) {
  const { id } = await params;

  const promo = await prisma.promoCode.findUnique({
    where: { id },
  });

  if (!promo) {
    notFound();
  }

  const initialData = {
    id: promo.id,
    code: promo.code,
    description: promo.description ?? "",
    discountType: promo.discountType as "PERCENTAGE" | "FIXED",
    discountValue: promo.discountValue,
    minPurchase: promo.minPurchase,
    maxUses: promo.maxUses,
    validFrom: promo.validFrom?.toISOString() ?? "",
    validUntil: promo.validUntil?.toISOString() ?? "",
    isActive: promo.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Promo</h2>
        <p className="text-muted-foreground">
          Ubah kode promo <span className="font-mono font-medium">{promo.code}</span>
        </p>
      </div>

      <PromoForm mode="edit" initialData={initialData} />
    </div>
  );
}
