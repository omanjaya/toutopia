import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        package: { select: { title: true } },
      },
    });

    return successResponse(
      transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        paymentMethod: t.paymentMethod,
        packageTitle: t.package?.title ?? null,
        description: (t.metadata as Record<string, string> | null)?.description ?? null,
        paidAt: t.paidAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
