import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { handleApiError } from "@/shared/lib/api-error";
import { createHash } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const loginUrl = new URL("/login", request.url);

    if (!token) {
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl);
    }

    const hashedToken = createHash("sha256").update(token).digest("hex");

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      loginUrl.searchParams.set("error", "token_expired");
      return NextResponse.redirect(loginUrl);
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      loginUrl.searchParams.set("error", "user_not_found");
      return NextResponse.redirect(loginUrl);
    }

    if (user.emailVerified) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: verificationToken.identifier },
      });
      loginUrl.searchParams.set("verified", "true");
      return NextResponse.redirect(loginUrl);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: verificationToken.identifier },
      }),
    ]);

    loginUrl.searchParams.set("verified", "true");
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    return handleApiError(error);
  }
}
