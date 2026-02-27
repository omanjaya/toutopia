import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { cacheDel } from "@/infrastructure/cache/cache.service";
import { z } from "zod";

const updateSchema = z.object({
  message: z.string().min(1).max(500).optional(),
  type: z.enum(["info", "warning", "success", "promo"]).optional(),
  linkUrl: z.string().url().nullable().optional(),
  linkText: z.string().max(50).nullable().optional(),
  isActive: z.boolean().optional(),
  endAt: z.string().datetime().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        endAt: data.endAt !== undefined ? (data.endAt ? new Date(data.endAt) : null) : undefined,
      },
    });

    await cacheDel("announcements:active");

    return successResponse(announcement);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.announcement.delete({ where: { id } });
    await cacheDel("announcements:active");

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
