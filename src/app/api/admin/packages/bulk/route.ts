import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["publish", "archive", "delete"]),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json() as unknown;
    const { ids, action } = bulkSchema.parse(body);

    if (action === "publish") {
      await prisma.examPackage.updateMany({
        where: { id: { in: ids }, status: "DRAFT" },
        data: { status: "PUBLISHED" },
      });
      return successResponse({ affected: ids.length });
    }

    if (action === "archive") {
      await prisma.examPackage.updateMany({
        where: { id: { in: ids } },
        data: { status: "ARCHIVED" },
      });
      return successResponse({ affected: ids.length });
    }

    if (action === "delete") {
      // Only delete packages with no attempts; archive the rest to preserve data integrity
      const packages = await prisma.examPackage.findMany({
        where: { id: { in: ids } },
        include: { _count: { select: { attempts: true } } },
      });

      const toDelete = packages.filter((p) => p._count.attempts === 0).map((p) => p.id);
      const toArchive = packages.filter((p) => p._count.attempts > 0).map((p) => p.id);

      if (toDelete.length > 0) {
        await prisma.examPackage.deleteMany({ where: { id: { in: toDelete } } });
      }
      if (toArchive.length > 0) {
        await prisma.examPackage.updateMany({
          where: { id: { in: toArchive } },
          data: { status: "ARCHIVED" },
        });
      }
      return successResponse({ deleted: toDelete.length, archived: toArchive.length });
    }

    return errorResponse("INVALID_ACTION", "Invalid action", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
