import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { subjectId } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) return notFoundResponse("Subject");

    const topics = await prisma.topic.findMany({
      where: { subjectId },
      select: { id: true, name: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return successResponse({ topics });
  } catch (error) {
    return handleApiError(error);
  }
}
