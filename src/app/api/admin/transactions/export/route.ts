import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: Request): Promise<Response> {
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

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const where: Prisma.TransactionWhereInput = {};
  if (statusFilter) where.status = statusFilter as Prisma.TransactionWhereInput["status"];
  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }
  if (from || to) {
    where.createdAt = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to + "T23:59:59") }),
    };
  }

  const orderBy: Prisma.TransactionOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" }
    : sort === "highest" ? { amount: "desc" }
    : sort === "lowest" ? { amount: "asc" }
    : { createdAt: "desc" };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy,
    take: 10000,
    select: {
      id: true,
      amount: true,
      paymentMethod: true,
      status: true,
      midtransId: true,
      paidAt: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      package: { select: { title: true } },
      ebook: { select: { title: true } },
    },
  });

  const statusLabel: Record<string, string> = {
    PAID: "Berhasil",
    PENDING: "Menunggu",
    FAILED: "Gagal",
    EXPIRED: "Kedaluwarsa",
    REFUNDED: "Refund",
  };
  const methodLabel: Record<string, string> = {
    QRIS: "QRIS",
    BANK_TRANSFER: "Transfer Bank",
    EWALLET: "E-Wallet",
    CREDIT_CARD: "Kartu Kredit",
  };

  const headers = [
    "ID",
    "Nama",
    "Email",
    "Produk",
    "Jumlah (Rp)",
    "Metode",
    "Status",
    "Midtrans ID",
    "Tanggal Bayar",
    "Tanggal Dibuat",
  ];

  const rows = transactions.map((t) => [
    t.id,
    t.user.name,
    t.user.email,
    t.package?.title ?? t.ebook?.title ?? "",
    String(t.amount),
    t.paymentMethod ? (methodLabel[t.paymentMethod] ?? t.paymentMethod) : "",
    statusLabel[t.status] ?? t.status,
    t.midtransId ?? "",
    t.paidAt ? new Date(t.paidAt).toISOString() : "",
    new Date(t.createdAt).toISOString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `transaksi-${dateStr}.csv`;

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
