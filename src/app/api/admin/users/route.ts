import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { hash } from "argon2";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  initialCredits: z.number().int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body: unknown = await request.json();
    const data = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      return errorResponse(
        "EMAIL_EXISTS",
        "Email sudah terdaftar",
        409
      );
    }

    if (data.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: data.phone },
        select: { id: true },
      });

      if (existingPhone) {
        return errorResponse(
          "PHONE_EXISTS",
          "Nomor telepon sudah terdaftar",
          409
        );
      }
    }

    const passwordHash = await hash(data.password);
    const referralCode = crypto.randomBytes(4).toString("hex");
    const initialCredits = data.initialCredits ?? 0;

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          phone: data.phone || null,
          role: data.role,
          referralCode,
          emailVerified: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          referralCode: true,
          createdAt: true,
        },
      });

      await tx.userCredit.create({
        data: {
          userId: newUser.id,
          balance: initialCredits,
          freeCredits: initialCredits,
        },
      });

      if (initialCredits > 0) {
        await tx.creditHistory.create({
          data: {
            userId: newUser.id,
            amount: initialCredits,
            type: "BONUS",
            description: "Kredit awal dari admin",
          },
        });
      }

      return newUser;
    });

    return successResponse(user, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
