import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import {
  backupFileSchema,
} from "@/shared/lib/validators/backup.validators";
import {
  previewRestore,
  processRestoreJob,
} from "@/infrastructure/backup/backup-service";
import { getRedis } from "@/infrastructure/cache/redis.client";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const action = formData.get("action") as string | null;

    if (!file) {
      return errorResponse("VALIDATION_ERROR", "File diperlukan", 400);
    }

    const text = await file.text();
    if (!text.trim()) {
      return errorResponse("VALIDATION_ERROR", "File kosong", 400);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return errorResponse("VALIDATION_ERROR", "File bukan JSON yang valid", 400);
    }

    const validation = backupFileSchema.safeParse(parsed);
    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Format file tidak sesuai",
        422,
        { issues: validation.error.issues.slice(0, 10).map((i) => i.message) }
      );
    }

    const backupData = validation.data;

    if (action === "restore") {
      const jobId = randomUUID();

      // Fire and forget
      processRestoreJob(jobId, backupData.questions, user.id).catch(
        async () => {
          const redis = await getRedis();
          if (redis) {
            await redis.set(
              `backup:job:${jobId}`,
              JSON.stringify({
                status: "error",
                progress: 0,
                total: 0,
                processed: 0,
                error: "Restore gagal. Silakan coba lagi.",
              }),
              "EX",
              3600
            );
          }
        }
      );

      return successResponse({ jobId });
    }

    // Default: preview
    const preview = await previewRestore(backupData.questions);
    return successResponse(preview);
  } catch (error) {
    return handleApiError(error);
  }
}
