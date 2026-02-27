import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET() {
  try {
    await requireAdmin();

    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        subject: {
          select: { name: true },
        },
      },
      orderBy: [
        { subject: { name: "asc" } },
        { name: "asc" },
      ],
    });

    const data = topics.map((t) => ({
      id: t.id,
      name: t.name,
      subject: t.subject.name,
    }));

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
