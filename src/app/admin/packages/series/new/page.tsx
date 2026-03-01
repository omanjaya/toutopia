import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { SeriesCreatorForm } from "@/shared/components/exam/series-creator-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buat Seri Paket | Admin Toutopia",
};

export default async function NewSeriesPage() {
  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      subCategories: {
        orderBy: { order: "asc" },
        include: {
          subjects: {
            orderBy: { order: "asc" },
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buat Seri Paket</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buat beberapa paket ujian sekaligus dengan struktur yang sama
        </p>
      </div>
      <SeriesCreatorForm categories={categories} />
    </div>
  );
}
