import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">AI Generator</h2>
            <p className="text-sm text-muted-foreground">
              Generate soal otomatis menggunakan AI atau import dari file
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start rounded-full border bg-muted/40 px-3 py-1.5 text-xs sm:self-auto">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              activeProviders.length > 0 ? "bg-green-500" : "bg-muted-foreground/40"
            }`}
          />
          <span className="text-muted-foreground">
            {activeProviders.length > 0
              ? `${activeProviders.length} provider aktif`
              : "Belum ada provider"}
          </span>
        </div>
      </div>

      <GeneratorForm categories={categories} activeProviders={activeProviders} />
    </div>
  );
}
