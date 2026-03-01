import { NextRequest } from "next/server";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { getRedis } from "@/infrastructure/cache/redis.client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { jobId } = await params;

    const redis = await getRedis();

    if (!redis) {
      return errorResponse(
        "CACHE_UNAVAILABLE",
        "Cache tidak tersedia",
        503
      );
    }

    const raw = await redis.get(`batch-generate:job:${jobId}`);

    if (!raw) {
      return errorResponse("JOB_NOT_FOUND", "Job tidak ditemukan atau sudah kadaluarsa", 404);
    }

    const jobState = JSON.parse(raw) as unknown;

    return successResponse(jobState);
  } catch (error) {
    return handleApiError(error);
  }
}
