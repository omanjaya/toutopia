import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
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
    include: {
      user: { select: { id: true, name: true, email: true } },
      package: { select: { id: true, title: true } },
      ebook: { select: { id: true, title: true } },
    },
  });

  if (!transaction) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: transaction });
}
