import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["ACTIVATE", "SUSPEND", "BAN"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { ids, action } = bulkSchema.parse(body);

    // Prevent acting on own account or other admins
    const targets = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, role: true },
    });
    const safeIds = targets
      .filter((u) => u.id !== session.id && u.role !== "SUPER_ADMIN" && u.role !== "ADMIN")
      .map((u) => u.id);

    if (safeIds.length === 0) {
      return successResponse({ affected: 0 });
    }

    const statusMap = { ACTIVATE: "ACTIVE", SUSPEND: "SUSPENDED", BAN: "BANNED" } as const;
    await prisma.user.updateMany({
      where: { id: { in: safeIds } },
      data: { status: statusMap[action] },
    });

    return successResponse({ affected: safeIds.length });
  } catch (error) {
    return handleApiError(error);
  }
}
