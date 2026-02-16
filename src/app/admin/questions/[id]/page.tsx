import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { QuestionDetail } from "./question-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Soal",
};

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      topic: {
        include: {
          subject: {
            include: {
              subCategory: {
                include: { category: true },
              },
            },
          },
        },
      },
      options: { orderBy: { order: "asc" } },
    },
  });

  if (!question) notFound();

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
    <QuestionDetail
      question={question}
      categories={categories}
    />
  );
}
