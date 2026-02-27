import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { uploadFile } from "@/infrastructure/minio";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const rl = checkRateLimit(`upload:${admin.id}`, rateLimits.upload);
    if (!rl.success) {
      return errorResponse("RATE_LIMIT", "Terlalu banyak upload. Coba lagi nanti.", 429);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("VALIDATION_ERROR", "File wajib diupload", 422);
    }

    if (file.type !== "application/pdf") {
      return errorResponse(
        "VALIDATION_ERROR",
        "Hanya file PDF yang diizinkan",
        422
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Ukuran file maksimal 50MB",
        422
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(buffer, file.type, "ebooks");

    return successResponse({ url, fileSize: file.size }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
