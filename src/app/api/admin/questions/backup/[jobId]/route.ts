import { NextRequest } from "next/server";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { getJobProgress } from "@/infrastructure/backup/backup-service";
import { cacheGet } from "@/infrastructure/cache/cache.service";
import type { BackupFile } from "@/shared/lib/validators/backup.validators";

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    await requireAdmin();

    const { jobId } = await params;
    const download = request.nextUrl.searchParams.get("download") === "true";

    const progress = await getJobProgress(jobId);
    if (!progress) {
      return errorResponse("JOB_NOT_FOUND", "Job tidak ditemukan", 404);
    }

    // If download requested and job is done, return the file
    if (download && progress.status === "done") {
      const backupFile = await cacheGet<BackupFile>(`backup:file:${jobId}`);
      if (!backupFile) {
        return errorResponse("FILE_EXPIRED", "File backup sudah expired. Silakan backup ulang.", 410);
      }

      const json = JSON.stringify(backupFile, null, 2);
      return new Response(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="backup-soal-${jobId}.json"`,
        },
      });
    }

    return successResponse(progress);
  } catch (error) {
    return handleApiError(error);
  }
}
