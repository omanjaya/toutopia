import { NextRequest } from "next/server";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { getJobProgress } from "@/infrastructure/backup/backup-service";

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    await requireAdmin();

    const { jobId } = await params;

    const progress = await getJobProgress(jobId);
    if (!progress) {
      return errorResponse("JOB_NOT_FOUND", "Job tidak ditemukan", 404);
    }

    return successResponse(progress);
  } catch (error) {
    return handleApiError(error);
  }
}
