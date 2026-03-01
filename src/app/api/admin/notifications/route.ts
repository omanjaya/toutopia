import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import type { NotificationType, Prisma } from "@prisma/client";

const ITEMS_PER_PAGE = 30;
const MAX_BROADCAST_USERS = 10000;

const broadcastSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(100, "Judul maksimal 100 karakter"),
  message: z.string().min(1, "Pesan wajib diisi").max(500, "Pesan maksimal 500 karakter"),
  type: z.enum([
    "STUDY_REMINDER",
    "EXAM_DEADLINE",
    "SCORE_UPDATE",
    "PAYMENT_SUCCESS",
    "PACKAGE_NEW",
    "QUESTION_STATUS",
    "SYSTEM",
  ]),
  userId: z.string().cuid().nullable().optional(),
  link: z.string().url("Link tidak valid").nullable().optional(),
});

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const type = searchParams.get("type") as NotificationType | null;
    const q = searchParams.get("q")?.trim() ?? "";

    const where: Prisma.NotificationWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return successResponse(notifications, {
      page,
      limit: ITEMS_PER_PAGE,
      total,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const body: unknown = await request.json();
    const data = broadcastSchema.parse(body);

    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true },
      });

      if (!user) {
        return errorResponse("USER_NOT_FOUND", "Pengguna tidak ditemukan", 404);
      }

      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          ...(data.link ? { data: { actionUrl: data.link } } : {}),
        },
      });

      return successResponse({ created: 1 }, undefined, 201);
    }

    // Broadcast to all users
    const users = await prisma.user.findMany({
      select: { id: true },
      take: MAX_BROADCAST_USERS,
    });

    if (users.length === 0) {
      return errorResponse("NO_USERS", "Tidak ada pengguna terdaftar", 400);
    }

    const notificationData = users.map((u) => ({
      userId: u.id,
      type: data.type,
      title: data.title,
      message: data.message,
      ...(data.link ? { data: { actionUrl: data.link } } : {}),
    }));

    const result = await prisma.notification.createMany({
      data: notificationData,
      skipDuplicates: false,
    });

    return successResponse({ created: result.count }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
