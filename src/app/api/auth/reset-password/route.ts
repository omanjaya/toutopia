import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { hash } from "argon2";
import { prisma } from "@/shared/lib/prisma";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError, RateLimitError } from "@/shared/lib/api-error";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`reset-password:${ip}`, rateLimits.auth);
    if (!rl.success) throw new RateLimitError();

    const body = await request.json();
    const { token, password } = schema.parse(body);

    // Hash the incoming token to compare with stored hash
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token: hashedToken, expiresAt: { gt: new Date() } },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!resetToken) {
      return errorResponse("INVALID_TOKEN", "Link reset tidak valid atau sudah kedaluwarsa", 400);
    }

    const passwordHash = await hash(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return successResponse({ message: "Password berhasil direset. Silakan login dengan password baru." });
  } catch (error) {
    return handleApiError(error);
  }
}
