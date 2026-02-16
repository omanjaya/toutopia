import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { ExamSession } from "./exam-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ujian Berlangsung",
};

export default async function ExamPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { attemptId } = await params;

  return <ExamSession attemptId={attemptId} />;
}
