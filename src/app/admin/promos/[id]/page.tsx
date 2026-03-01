import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { Tag, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
          <h2 className="text-2xl font-semibold tracking-tight">Edit Promo</h2>
          <p className="text-sm text-muted-foreground">
            Ubah kode <span className="font-mono font-medium text-foreground">{promo.code}</span>
          </p>
        </div>
      </div>

      <PromoForm mode="edit" initialData={initialData} />
    </div>
  );
}
