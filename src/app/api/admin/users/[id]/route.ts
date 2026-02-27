import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        credits: {
          select: { balance: true, freeCredits: true },
        },
        creditHistory: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
        attempts: {
          orderBy: { startedAt: "desc" },
          take: 50,
          select: {
            id: true,
            status: true,
            score: true,
            startedAt: true,
            finishedAt: true,
            package: {
              select: { id: true, title: true },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            package: {
              select: { id: true, title: true },
            },
          },
        },
        packageAccesses: {
          orderBy: { grantedAt: "desc" },
          take: 50,
          select: {
            id: true,
            grantedBy: true,
            grantedAt: true,
            expiresAt: true,
            reason: true,
            package: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User tidak ditemukan", 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
