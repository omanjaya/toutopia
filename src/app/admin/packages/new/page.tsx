import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { PackageForm } from "@/shared/components/exam/package-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buat Paket Ujian",
};

export default async function NewPackagePage() {
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
        <h2 className="text-2xl font-bold tracking-tight">Buat Paket Ujian</h2>
        <p className="text-muted-foreground">
          Buat paket try out baru untuk peserta
        </p>
      </div>

      <PackageForm
        categories={categories}
        backUrl="/admin/packages"
        apiUrl="/api/admin/packages"
      />
    </div>
  );
}
