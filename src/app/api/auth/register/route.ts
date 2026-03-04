import { NextRequest } from "next/server";
import { hash } from "argon2";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/shared/lib/prisma";
import { registerSchema } from "@/shared/lib/validators";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError, RateLimitError } from "@/shared/lib/api-error";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";
import { sendEmailAsync } from "@/infrastructure/email/email.service";
import { verifyEmailHtml } from "@/infrastructure/email/templates/verify-email";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TOU-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`register:${ip}`, rateLimits.auth);
    if (!rl.success) throw new RateLimitError();

    const body = await request.json();
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("EMAIL_EXISTS", "Email sudah terdaftar", 409);
    }

    const passwordHash = await hash(data.password);

    let referrerId: string | undefined;

    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode },
        select: { id: true, status: true },
      });
      // Only grant referral if the referrer is an active account
      if (referrer && referrer.status === "ACTIVE") {
        referrerId = referrer.id;
      }
    }

    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    const referralCode = generateReferralCode();

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: data.name,
          passwordHash,
          emailVerified: null,
          role: "STUDENT",
          referralCode,
          referredById: referrerId,
          credits: {
            create: {
              balance: 0,
              freeCredits: 2,
            },
          },
          profile: {
            create: {},
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      await tx.creditHistory.create({
        data: {
          userId: newUser.id,
          amount: 2,
          type: "FREE_SIGNUP",
          description: "Kredit gratis pendaftaran",
        },
      });

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return newUser;
    });

    if (referrerId) {
      await prisma.$transaction([
        prisma.userCredit.upsert({
          where: { userId: referrerId },
          update: { freeCredits: { increment: 5 } },
          create: { userId: referrerId, balance: 0, freeCredits: 5 },
        }),
        prisma.creditHistory.create({
          data: {
            userId: referrerId,
            amount: 5,
            type: "BONUS",
            description: `Referral bonus dari ${data.name}`,
            referenceId: user.id,
          },
        }),
      ]);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${rawToken}`;

    sendEmailAsync({
      to: user.email,
      subject: "Verifikasi Email — Toutopia",
      html: verifyEmailHtml(user.name ?? "Pengguna", verifyUrl),
    });

    return successResponse(user, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
