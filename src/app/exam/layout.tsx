import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";

export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Exam pages use a full-screen layout without the dashboard sidebar
  return <>{children}</>;
}
