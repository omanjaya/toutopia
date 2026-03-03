import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// POST /api/admin/subscriptions/expire
// Transitions all expired ACTIVE subscriptions to EXPIRED status.
// Intended to be called by a cron job.
export async function POST(): Promise<Response> {
  try {
    await requireAdmin();

    const now = new Date();

    const expiredSubs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
      },
      select: { id: true, userId: true },
    });

    if (expiredSubs.length === 0) {
      return successResponse({ expired: 0 });
    }

    const subIds = expiredSubs.map(
      (s: { id: string; userId: string }) => s.id
    );
    const userIds = Array.from(
      new Set(expiredSubs.map((s: { id: string; userId: string }) => s.userId))
    );

    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.subscription.updateMany({
        where: { id: { in: subIds } },
        data: { status: "EXPIRED" },
      });

      await tx.userPackageAccess.deleteMany({
        where: {
          userId: { in: userIds },
          grantedBy: "SUBSCRIPTION",
        },
      });
    });

    return successResponse({ expired: expiredSubs.length });
  } catch (error) {
    return handleApiError(error);
  }
}
