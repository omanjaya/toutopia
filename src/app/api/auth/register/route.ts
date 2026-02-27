import { NextRequest } from "next/server";
import { hash } from "argon2";
import { prisma } from "@/shared/lib/prisma";
import { registerSchema } from "@/shared/lib/validators";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError, RateLimitError } from "@/shared/lib/api-error";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";
import { sendEmailAsync } from "@/infrastructure/email/email.service";
import { welcomeEmailHtml } from "@/infrastructure/email/templates/welcome";

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
        select: { id: true },
      });
      if (referrer) referrerId = referrer.id;
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: data.name,
          passwordHash,
          role: "STUDENT",
          referredById: referrerId,
          credits: {
            create: {
              balance: 0,
              freeCredits: 2,
            },
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

    sendEmailAsync({
      to: user.email,
      subject: "Selamat Datang di Toutopia!",
      html: welcomeEmailHtml(user.name ?? "Pengguna"),
    });

    return successResponse(user, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
