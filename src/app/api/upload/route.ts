import { NextRequest } from "next/server";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { uploadFile } from "@/infrastructure/minio";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rl = checkRateLimit(`upload:${user.id}`, rateLimits.upload);
    if (!rl.success) {
      return errorResponse("RATE_LIMIT", "Terlalu banyak upload. Coba lagi nanti.", 429);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("VALIDATION_ERROR", "File wajib dikirim", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF",
        400
      );
    }

    if (file.size > MAX_SIZE) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Ukuran file maksimal 5MB",
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(buffer, file.type);

    return successResponse({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
