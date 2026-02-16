import { NextRequest } from "next/server";
import { hash } from "argon2";
import { prisma } from "@/shared/lib/prisma";
import { registerSchema } from "@/shared/lib/validators";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError, RateLimitError } from "@/shared/lib/api-error";
import { checkRateLimit, rateLimits } from "@/shared/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`register:${ip}`, rateLimits.auth);
    if (!rl.success) throw new RateLimitError();

    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return errorResponse("EMAIL_EXISTS", "Email sudah terdaftar", 409);
    }

    const passwordHash = await hash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: "STUDENT",
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

    await prisma.creditHistory.create({
      data: {
        userId: user.id,
        amount: 2,
        type: "FREE_SIGNUP",
        description: "Kredit gratis pendaftaran",
      },
    });

    return successResponse(user, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
