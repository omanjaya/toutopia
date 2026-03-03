import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import type { Prisma } from "@prisma/client";

const EXPIRY_WARNING_DAYS = 7;
const NOTIFICATION_KIND = "SUBSCRIPTION_EXPIRY";

// POST /api/admin/subscriptions/notify-expiry
// Sends in-app notifications to users whose subscriptions expire within 7 days.
// Intended to be called daily by a cron job.
export async function POST(): Promise<Response> {
  try {
    await requireAdmin();

    const now = new Date();
    const warningDeadline = new Date(
      now.getTime() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000
    );

    const expiringSubs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gt: now,
          lte: warningDeadline,
        },
      },
      select: {
        id: true,
        userId: true,
        endDate: true,
        bundle: { select: { name: true } },
      },
    });

    if (expiringSubs.length === 0) {
      return successResponse({ notified: 0, total: 0 });
    }

    const subIds = expiringSubs.map(
      (s: { id: string; userId: string; endDate: Date; bundle: { name: string } | null }) => s.id
    );

    // Find already-sent expiry notifications for these subscriptions
    const existingNotifications = await prisma.notification.findMany({
      where: {
        type: "SYSTEM",
        data: {
          path: ["kind"],
          equals: NOTIFICATION_KIND,
        },
        userId: {
          in: expiringSubs.map(
            (s: { id: string; userId: string }) => s.userId
          ),
        },
      },
      select: {
        data: true,
      },
    });

    const alreadyNotifiedSubIds = new Set<string>();
    for (const n of existingNotifications) {
      const payload = n.data as Record<string, unknown> | null;
      if (payload && typeof payload.subscriptionId === "string") {
        alreadyNotifiedSubIds.add(payload.subscriptionId);
      }
    }

    const toNotify = expiringSubs.filter(
      (s: { id: string }) => !alreadyNotifiedSubIds.has(s.id)
    );

    if (toNotify.length === 0) {
      return successResponse({ notified: 0, total: subIds.length });
    }

    const notificationData: Prisma.NotificationCreateManyInput[] = toNotify.map(
      (sub: { id: string; userId: string; endDate: Date; bundle: { name: string } | null }) => {
        const expiryDate = sub.endDate.toLocaleDateString("id-ID", {
          dateStyle: "long",
        });
        const bundleName = sub.bundle?.name ?? "Anda";

        return {
          userId: sub.userId,
          type: "SYSTEM" as const,
          title: "Langganan Akan Berakhir",
          message: `Langganan ${bundleName} akan berakhir pada ${expiryDate}. Perpanjang sekarang untuk tetap menikmati akses unlimited.`,
          data: {
            kind: NOTIFICATION_KIND,
            subscriptionId: sub.id,
            actionUrl: "/dashboard/subscription",
          } as Prisma.InputJsonValue,
        };
      }
    );

    const result = await prisma.notification.createMany({
      data: notificationData,
    });

    return successResponse({ notified: result.count, total: subIds.length });
  } catch (error) {
    return handleApiError(error);
  }
}
