import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("SET_BALANCE"),
    balance: z.number().int().min(0, "Saldo tidak boleh negatif"),
  }),
  z.object({
    action: z.literal("ADJUST"),
    amount: z.number().int(),
    note: z.string().min(1, "Catatan wajib diisi"),
  }),
]);

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const [credit, history] = await Promise.all([
      prisma.userCredit.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          balance: true,
          freeCredits: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.creditHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          referenceId: true,
          createdAt: true,
        },
      }),
    ]);

    if (!credit) {
      return errorResponse("NOT_FOUND", "Data kredit user tidak ditemukan", 404);
    }

    return successResponse({ credit, history });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const body: unknown = await request.json();
    const data = patchSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return errorResponse("NOT_FOUND", "User tidak ditemukan", 404);
    }

    if (data.action === "SET_BALANCE") {
      const result = await prisma.$transaction([
        prisma.userCredit.upsert({
          where: { userId },
          update: { balance: data.balance },
          create: { userId, balance: data.balance },
        }),
        prisma.creditHistory.create({
          data: {
            userId,
            amount: data.balance,
            type: "BONUS",
            description: "Set saldo oleh admin",
          },
        }),
      ]);
      return successResponse({ updated: true, balance: result[0].balance });
    }

    // ADJUST action — read + update inside transaction to prevent TOCTOU race
    const creditType = data.amount >= 0 ? ("BONUS" as const) : ("USAGE" as const);

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.userCredit.findUnique({ where: { userId } });
      const currentBalance = current?.balance ?? 0;
      const newBalance = currentBalance + data.amount;

      if (newBalance < 0) {
        throw Object.assign(
          new Error(`Saldo tidak mencukupi. Saldo saat ini: ${currentBalance}, pengurangan: ${Math.abs(data.amount)}`),
          { code: "INSUFFICIENT_CREDITS" }
        );
      }

      const updated = await tx.userCredit.upsert({
        where: { userId },
        update: { balance: { increment: data.amount } },
        create: { userId, balance: Math.max(0, data.amount) },
      });

      await tx.creditHistory.create({
        data: {
          userId,
          amount: data.amount,
          type: creditType,
          description: data.note,
        },
      });

      return updated;
    });

    return successResponse({ updated: true, balance: result.balance });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "INSUFFICIENT_CREDITS") {
      return errorResponse("INSUFFICIENT_CREDITS", (error as Error).message, 400);
    }
    return handleApiError(error);
  }
}
