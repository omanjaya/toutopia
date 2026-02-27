import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const entity = searchParams.get("entity") ?? "";
    const userId = searchParams.get("userId") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 30;

    const where: Prisma.AuditLogWhereInput = {};
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse(logs, { page, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return handleApiError(error);
  }
}
