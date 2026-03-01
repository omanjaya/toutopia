import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";

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
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!transaction) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } },
      { status: 404 }
    );
  }
  if (transaction.status !== "PAID") {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_STATUS", message: "Hanya transaksi PAID yang bisa direfund" },
      },
      { status: 422 }
    );
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: { status: "REFUNDED" },
    select: { id: true, status: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
