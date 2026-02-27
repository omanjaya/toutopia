import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { handleApiError } from "@/shared/lib/api-error";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") ?? "";
    const roleFilter = searchParams.get("role") ?? "";
    const statusFilter = searchParams.get("status") ?? "";

    const where: Prisma.UserWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    if (roleFilter) {
      where.role = roleFilter as Prisma.UserWhereInput["role"];
    }

    if (statusFilter) {
      where.status = statusFilter as Prisma.UserWhereInput["status"];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        credits: {
          select: { balance: true },
        },
      },
    });

    const header = "Name,Email,Phone,Role,Status,Credits,Registered,Last Login";
    const rows = users.map((user) => {
      const name = escapeCsvField(user.name);
      const email = escapeCsvField(user.email);
      const phone = user.phone ?? "";
      const role = user.role;
      const status = user.status;
      const credits = user.credits?.balance ?? 0;
      const registered = format(user.createdAt, "yyyy-MM-dd HH:mm", {
        locale: localeId,
      });
      const lastLogin = user.lastLoginAt
        ? format(user.lastLoginAt, "yyyy-MM-dd HH:mm", { locale: localeId })
        : "";

      return `${name},${email},${phone},${role},${status},${credits},${registered},${lastLogin}`;
    });

    const csv = [header, ...rows].join("\n");
    const today = format(new Date(), "yyyy-MM-dd");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-export-${today}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
