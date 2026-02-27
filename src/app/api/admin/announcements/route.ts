import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { cacheDel } from "@/infrastructure/cache/cache.service";
import { z } from "zod";

const createSchema = z.object({
  message: z.string().min(1).max(500),
  type: z.enum(["info", "warning", "success", "promo"]).default("info"),
  linkUrl: z.string().url().nullable().optional(),
  linkText: z.string().max(50).nullable().optional(),
  isActive: z.boolean().default(true),
  endAt: z.string().datetime().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin();

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });

    return successResponse(announcements);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createSchema.parse(body);

    const announcement = await prisma.announcement.create({
      data: {
        message: data.message,
        type: data.type,
        linkUrl: data.linkUrl ?? null,
        linkText: data.linkText ?? null,
        isActive: data.isActive,
        endAt: data.endAt ? new Date(data.endAt) : null,
      },
    });

    await cacheDel("announcements:active");

    return successResponse(announcement);
  } catch (error) {
    return handleApiError(error);
  }
}
