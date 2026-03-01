import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";
import { PRICING } from "@/shared/lib/validators/payment.validators";

export async function POST(
  _req: Request,
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

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        select: { status: true, userId: true, metadata: true },
      });

      if (!transaction) {
        throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
      }
      if (transaction.status !== "PAID") {
        throw Object.assign(new Error("INVALID_STATUS"), { code: "INVALID_STATUS" });
      }

      const result = await tx.transaction.update({
        where: { id },
        data: { status: "REFUNDED" },
        select: { id: true, status: true },
      });

      // Reverse the credits that were granted when this transaction was paid
      const metadata = transaction.metadata as Record<string, string> | null;
      const type = metadata?.type;
      let creditsToReverse = 0;

      if (type === "SINGLE_PACKAGE") {
        creditsToReverse = 1;
      } else if (type === "CREDIT_BUNDLE") {
        const bundleSize = metadata?.bundleSize;
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
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
