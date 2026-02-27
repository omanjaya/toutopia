import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { ExamResultMobile } from "./exam-result-mobile";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { attemptId } = await params;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    select: {
      score: true,
      package: { select: { title: true } },
    },
  });

  if (!attempt) return { title: "Hasil Ujian" };

  const score = Math.round(attempt.score ?? 0);
  const title = `Skor ${score}/1000 — ${attempt.package.title}`;

  return {
    title: "Hasil Ujian — Toutopia",
    openGraph: {
      title,
      description: `Hasil try out di Toutopia: ${score}/1000 pada ${attempt.package.title}`,
      images: [
        {
          url: `/api/exam/${attemptId}/share`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [`/api/exam/${attemptId}/share`],
    },
  };
}

export default async function MobileExamResultPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { attemptId } = await params;

  return <ExamResultMobile attemptId={attemptId} />;
}
