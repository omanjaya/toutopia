import { NextRequest } from "next/server";
import { verify } from "argon2";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  password: z.string().optional(),
  confirmation: z.literal("HAPUS AKUN SAYA"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = checkRateLimit(`delete-account:${ip}`, { maxRequests: 3, windowMs: 3600000 });
    if (!rl.success) {
      return errorResponse("RATE_LIMITED", "Terlalu banyak permintaan", 429);
    }

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const { password, confirmation } = schema.parse(body);

    if (confirmation !== "HAPUS AKUN SAYA") {
      return errorResponse("INVALID_CONFIRMATION", "Konfirmasi tidak valid", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) return errorResponse("USER_NOT_FOUND", "User tidak ditemukan", 404);

    // If user has password (non-Google), require password verification
    if (user.passwordHash) {
      if (!password) {
        return errorResponse("PASSWORD_REQUIRED", "Password diperlukan untuk menghapus akun", 400);
      }
      const valid = await verify(user.passwordHash, password);
      if (!valid) {
        return errorResponse("INVALID_PASSWORD", "Password salah", 400);
      }
    }

    // Soft delete: anonymize and set status to DELETED
    const anonymizedEmail = `deleted_${user.id}@deleted.toutopia.id`;
    const anonymizedName = "Pengguna Terhapus";

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          email: anonymizedEmail,
          name: anonymizedName,
          avatar: null,
          phone: null,
          passwordHash: null,
          referralCode: null,
          status: "BANNED",
        },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
    ]);

    return successResponse({ message: "Akun berhasil dihapus" });
  } catch (error) {
    return handleApiError(error);
  }
}
