import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { GeneratorForm } from "./generator-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Generator — Admin",
};

export default async function AiGeneratorPage() {
  const [categories, activeProviders] = await Promise.all([
    prisma.examCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        subCategories: {
          orderBy: { order: "asc" },
          include: {
            subjects: {
              orderBy: { order: "asc" },
              include: {
                topics: { orderBy: { order: "asc" } },
              },
            },
          },
        },
      },
    }),
    prisma.aiProviderConfig.findMany({
      where: { isActive: true },
      select: { provider: true, model: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">AI Generator</h2>
        <p className="text-muted-foreground">
          Generate soal otomatis menggunakan AI atau import dari file
        </p>
      </div>

      <GeneratorForm
        categories={categories}
        activeProviders={activeProviders}
      />
    </div>
  );
}
