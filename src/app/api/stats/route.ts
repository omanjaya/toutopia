import { prisma } from "@/shared/lib/prisma";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  try {
    const [userCount, attemptCount, questionCount, packageCount] = await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.examAttempt.count({ where: { status: "COMPLETED" } }),
      prisma.question.count({ where: { status: "APPROVED" } }),
      prisma.examPackage.count({ where: { status: "PUBLISHED" } }),
    ]);

    return successResponse({
      users: userCount,
      attempts: attemptCount,
      questions: questionCount,
      packages: packageCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
