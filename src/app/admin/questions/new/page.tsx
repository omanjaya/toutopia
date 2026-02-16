import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import { QuestionForm } from "@/shared/components/exam/question-form";

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Buat Soal Baru</h2>
        <p className="text-muted-foreground">
          Tambahkan soal baru ke bank soal
        </p>
      </div>

      <QuestionForm
        categories={categories}
        backUrl="/admin/questions"
        apiUrl="/api/admin/questions"
      />
    </div>
  );
}
