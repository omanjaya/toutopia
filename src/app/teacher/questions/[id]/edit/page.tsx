import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { QuestionForm } from "@/shared/components/exam/question-form";
import type { CreateQuestionInput } from "@/shared/lib/validators/question.validators";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Soal — Pengajar",
};

export default async function TeacherEditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { order: "asc" } },
    },
  });

  if (!question || question.createdById !== session.user.id) notFound();

  if (question.status !== "DRAFT" && question.status !== "REJECTED") {
    redirect(`/teacher/questions/${id}`);
  }

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

  const initialData: CreateQuestionInput & { id: string } = {
    id: question.id,
    topicId: question.topicId,
    type: question.type as CreateQuestionInput["type"],
    difficulty: question.difficulty as CreateQuestionInput["difficulty"],
    content: question.content,
    explanation: question.explanation,
    source: question.source,
    year: question.year,
    imageUrl: question.imageUrl,
    options: question.options.map((opt) => ({
      label: opt.label,
      content: opt.content,
      imageUrl: opt.imageUrl,
      isCorrect: opt.isCorrect,
      order: opt.order,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Soal</h2>
        <p className="text-muted-foreground">
          Soal yang diedit akan dikirim ulang untuk review
        </p>
      </div>

      <QuestionForm
        categories={categories}
        initialData={initialData}
        backUrl={`/teacher/questions/${id}`}
        apiUrl={`/api/teacher/questions/${id}`}
      />
    </div>
  );
}
