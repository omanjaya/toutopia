import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id: packageId } = await params;

    const body = await request.json();
    const { orderedIds } = reorderSchema.parse(body);

    // Verify package exists
    const pkg = await prisma.examPackage.findUnique({
      where: { id: packageId },
      select: { id: true },
    });

    if (!pkg) return notFoundResponse("Paket ujian");

    // Fetch all sections for this package
    const existingSections = await prisma.examSection.findMany({
      where: { packageId },
      select: { id: true },
    });

    const existingSectionIds = new Set(existingSections.map((s) => s.id));

    // Validate all provided IDs belong to this package
    const invalidIds = orderedIds.filter((id) => !existingSectionIds.has(id));
    if (invalidIds.length > 0) {
      return errorResponse(
        "INVALID_SECTION_IDS",
        `Seksi berikut tidak ditemukan di paket ini: ${invalidIds.join(", ")}`,
        400
      );
    }

    // Validate that all existing sections are accounted for in the new order
    if (orderedIds.length !== existingSections.length) {
      return errorResponse(
        "INCOMPLETE_ORDER",
        `Urutan harus mencakup semua ${existingSections.length} seksi dalam paket`,
        400
      );
    }

    // Update order for each section in a transaction
    await prisma.$transaction(
      orderedIds.map((id, idx) =>
        prisma.examSection.update({
          where: { id },
          data: { order: idx },
        })
      )
    );

    return successResponse({ reordered: orderedIds.length });
  } catch (error) {
    return handleApiError(error);
  }
}
