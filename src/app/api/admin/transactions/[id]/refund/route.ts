import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";
import { PRICING } from "@/shared/lib/validators/payment.validators";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

interface RefundRequestBody {
  refundAmount?: number;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
      { status: 403 }
    );
  }

  const { id } = await params;

  let body: RefundRequestBody = {};
  try {
    body = (await req.json()) as RefundRequestBody;
  } catch {
    // No body is fine — full refund by default
  }

  const requestedRefundAmount = body.refundAmount;

  try {
    const updated = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        select: {
          status: true,
          amount: true,
          userId: true,
          metadata: true,
          packageId: true,
          createdAt: true,
          refundedAmount: true,
        },
      });

      if (!transaction) {
        throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
      }
      if (transaction.status !== "PAID") {
        throw Object.assign(new Error("INVALID_STATUS"), { code: "INVALID_STATUS" });
      }

      const isPartial =
        requestedRefundAmount != null &&
        requestedRefundAmount > 0 &&
        requestedRefundAmount < transaction.amount;

      const refundAmount = isPartial ? requestedRefundAmount : transaction.amount;
      const totalRefunded = (transaction.refundedAmount ?? 0) + refundAmount;

      if (totalRefunded > transaction.amount) {
        throw Object.assign(new Error("EXCEEDS_AMOUNT"), { code: "EXCEEDS_AMOUNT" });
      }

      const newStatus = totalRefunded >= transaction.amount ? "REFUNDED" : "PAID";

      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: newStatus,
          refundedAmount: totalRefunded,
        },
        select: { id: true, status: true, refundedAmount: true },
      });

      // Only reverse credits/access on full refund
      if (newStatus === "REFUNDED") {
        const metadata = transaction.metadata as Record<string, unknown> | null;
        const type = metadata?.type as string | undefined;
        let creditsToReverse = 0;

        if (type === "SINGLE_PACKAGE") {
          creditsToReverse = 1;
        } else if (type === "CREDIT_BUNDLE") {
          const bundleSize = metadata?.bundleSize as string | undefined;
          creditsToReverse =
            bundleSize === "10"
              ? PRICING.CREDIT_BUNDLE_10.credits
              : PRICING.CREDIT_BUNDLE_5.credits;
        } else if (type === "SUBSCRIPTION") {
          creditsToReverse = 999;
        }

        if (creditsToReverse > 0) {
          await tx.userCredit.updateMany({
            where: { userId: transaction.userId },
            data: { balance: { decrement: creditsToReverse } },
          });

          await tx.creditHistory.create({
            data: {
              userId: transaction.userId,
              amount: -creditsToReverse,
              type: "USAGE",
              description: `Refund transaksi ${id}`,
              referenceId: id,
            },
          });
        }

        // Reverse UserPackageAccess for single package purchases
        if (type === "SINGLE_PACKAGE" && transaction.packageId) {
          await tx.userPackageAccess.deleteMany({
            where: {
              userId: transaction.userId,
              packageId: transaction.packageId,
              grantedBy: "PAYMENT",
            },
          });
        }

        // Expire subscription and remove subscription-granted access
        if (type === "SUBSCRIPTION") {
          await tx.subscription.updateMany({
            where: {
              userId: transaction.userId,
              status: "ACTIVE",
              createdAt: {
                gte: new Date(transaction.createdAt.getTime() - 60000),
                lte: new Date(transaction.createdAt.getTime() + 60000),
              },
            },
            data: { status: "CANCELLED" },
          });

          await tx.userPackageAccess.deleteMany({
            where: {
              userId: transaction.userId,
              grantedBy: "SUBSCRIPTION",
            },
          });
        }

        // Decrement promo code usage if one was applied
        const promoCodeId = metadata?.promoCodeId as string | undefined;
        if (promoCodeId) {
          await tx.promoCode.update({
            where: { id: promoCodeId },
            data: { usedCount: { decrement: 1 } },
          });
        }
      } else {
        // Partial refund: log credit history entry for the partial amount
        await tx.creditHistory.create({
          data: {
            userId: transaction.userId,
            amount: 0,
            type: "USAGE",
            description: `Refund parsial Rp ${refundAmount.toLocaleString("id-ID")} untuk transaksi ${id}`,
            referenceId: id,
          },
        });
      }

      return result;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } },
        { status: 404 }
      );
    }
    if (code === "INVALID_STATUS") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_STATUS", message: "Hanya transaksi PAID yang bisa direfund" },
        },
        { status: 422 }
      );
    }
    if (code === "EXCEEDS_AMOUNT") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EXCEEDS_AMOUNT", message: "Jumlah refund melebihi total transaksi" },
        },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
