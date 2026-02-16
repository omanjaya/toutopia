import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { ExamResult } from "./exam-result";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hasil Ujian",
};

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { attemptId } = await params;

  return <ExamResult attemptId={attemptId} />;
}
