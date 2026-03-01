import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const patchStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "LIVE", "ENDED", "CANCELLED"]),
});

// PATCH: Update event status (Go Live, End Event)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id } = await params;

    const event = await prisma.liveEvent.findUnique({ where: { id } });
    if (!event) return notFoundResponse("Live Event");

    const body = await request.json();
    const { status } = patchStatusSchema.parse(body);

    const updated = await prisma.liveEvent.update({
      where: { id },
      data: { status },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Hard delete a live event (cascade deletes registrations)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id } = await params;

    const event = await prisma.liveEvent.findUnique({ where: { id } });
    if (!event) return notFoundResponse("Live Event");

    if (event.status === "LIVE") {
      return errorResponse(
        "CANNOT_DELETE_LIVE",
        "Tidak dapat menghapus event yang sedang berlangsung",
        400
      );
    }

    await prisma.liveEvent.delete({ where: { id } });

    return successResponse({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
