import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { updatePromoSchema } from "@/shared/lib/validators/promo.validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id } = await params;

    const promo = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true } },
        usages: {
          take: 20,
          orderBy: { usedAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!promo) return notFoundResponse("Promo code");

    return successResponse(promo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updatePromoSchema.parse(body);

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Promo code");

    const promo = await prisma.promoCode.update({
      where: { id },
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxUses: data.maxUses,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        isActive: data.isActive,
      },
    });

    return successResponse(promo);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse("DUPLICATE_CODE", "Kode promo sudah digunakan", 409);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.promoCode.findUnique({
      where: { id },
      include: { _count: { select: { usages: true } } },
    });
    if (!existing) return notFoundResponse("Promo code");

    // Soft-delete if promo has been used, hard-delete otherwise
    if (existing._count.usages > 0) {
      await prisma.promoCode.update({
        where: { id },
        data: { isActive: false },
      });
      return successResponse({ deactivated: true });
    }

    await prisma.promoCode.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
