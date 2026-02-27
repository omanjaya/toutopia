import { NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/shared/lib/prisma";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";
import { RateLimitError } from "@/shared/lib/api-error";
import { sendEmailAsync } from "@/infrastructure/email/email.service";
import { resetPasswordEmailHtml } from "@/infrastructure/email/templates/reset-password";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`forgot-pwd:${ip}`, rateLimits.auth);
    if (!rl.success) throw new RateLimitError();

    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, passwordHash: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.passwordHash) {
      return successResponse({ message: "Jika email terdaftar, kami akan mengirim link reset password." });
    }

    // Delete existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate token and store hashed version
    const token = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    sendEmailAsync({
      to: email,
      subject: "Reset Password — Toutopia",
      html: resetPasswordEmailHtml(user.name ?? "Pengguna", resetUrl),
    });

    return successResponse({ message: "Jika email terdaftar, kami akan mengirim link reset password." });
  } catch (error) {
    return handleApiError(error);
  }
}
