import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { createPromoSchema } from "@/shared/lib/validators/promo.validators";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const search = searchParams.get("search") ?? "";
    const skip = (page - 1) * limit;

    const where: Prisma.PromoCodeWhereInput = search
      ? { code: { contains: search.toUpperCase(), mode: "insensitive" } }
      : {};

    const [promos, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { usages: true } } },
      }),
      prisma.promoCode.count({ where }),
    ]);

    return successResponse(promos, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createPromoSchema.parse(body);

    const promo = await prisma.promoCode.create({
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

    return successResponse(promo, undefined, 201);
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
