import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { VAPID_PUBLIC_KEY } from "@/shared/lib/web-push";

export async function GET() {
  try {
    await requireAuth();
    return successResponse({ publicKey: VAPID_PUBLIC_KEY });
  } catch (error) {
    return handleApiError(error);
  }
}
