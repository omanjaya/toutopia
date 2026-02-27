import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import type { SessionUser } from "@/shared/types/user.types";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingCompleted: true },
  });

  if (profile?.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
