import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma";
import { Wand2, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { AutoGenerateForm } from "@/shared/components/exam/auto-generate-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Auto Generate Paket | Admin Toutopia",
};

export default async function AutoGeneratePage() {
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/admin/packages">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Auto Generate Paket</h2>
          <p className="text-sm text-muted-foreground">
            Buat paket ujian lengkap dengan soal AI-generated dalam 1 klik
          </p>
        </div>
      </div>
      <AutoGenerateForm categories={categories} />
    </div>
  );
}
