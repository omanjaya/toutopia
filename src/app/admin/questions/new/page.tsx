import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { QuestionForm } from "@/shared/components/exam/question-form";
import Link from "next/link";
import { FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buat Soal Baru",
};

export default async function NewQuestionPage() {
  const categories = await prisma.examCategory.findMany({
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
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/admin/questions">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Buat Soal Baru</h2>
          <p className="text-sm text-muted-foreground">Tambahkan soal baru ke bank soal</p>
        </div>
      </div>

      <QuestionForm
        categories={categories}
        backUrl="/admin/questions"
        apiUrl="/api/admin/questions"
      />
    </div>
  );
}
