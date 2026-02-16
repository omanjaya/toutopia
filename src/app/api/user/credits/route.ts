import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();

    const credit = await prisma.userCredit.findUnique({
      where: { userId: user.id },
    });

    const history = await prisma.creditHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return successResponse({
      balance: credit?.balance ?? 0,
      freeCredits: credit?.freeCredits ?? 0,
      history,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
