import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { backupRequestSchema } from "@/shared/lib/validators/backup.validators";
import { processBackupJob } from "@/infrastructure/backup/backup-service";
import { cacheSet } from "@/infrastructure/cache/cache.service";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const body = await request.json();
    const filters = backupRequestSchema.parse(body);

    const jobId = randomUUID();

    // Fire and forget — process in background
    processBackupJob(jobId, filters)
      .then(async (backupFile) => {
        // Store result in Redis for download (TTL 1 hour)
        await cacheSet(`backup:file:${jobId}`, backupFile, 3600);
      })
      .catch(async () => {
        const { getRedis } = await import("@/infrastructure/cache/redis.client");
        const redis = await getRedis();
        if (redis) {
          await redis.set(
            `backup:job:${jobId}`,
            JSON.stringify({
              status: "error",
              progress: 0,
              total: 0,
              processed: 0,
              error: "Backup gagal. Silakan coba lagi.",
            }),
            "EX",
            3600
          );
        }
      });

    return successResponse({ jobId });
  } catch (error) {
    return handleApiError(error);
  }
}
