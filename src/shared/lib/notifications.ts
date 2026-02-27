import { prisma } from "./prisma";
import type { NotificationType, Prisma } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

const typeToPreference: Partial<Record<NotificationType, "notifyExamResult" | "notifyPayment" | "notifyPromo">> = {
  SCORE_UPDATE: "notifyExamResult",
  PAYMENT_SUCCESS: "notifyPayment",
  PACKAGE_NEW: "notifyPromo",
};

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams) {
  const prefKey = typeToPreference[type];
  if (prefKey) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { [prefKey]: true },
    });
    if (profile && profile[prefKey] === false) {
      return null;
    }
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: (data ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function createBulkNotifications(
  notifications: CreateNotificationParams[]
) {
  return prisma.notification.createMany({
    data: notifications.map((n) => ({
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      data: (n.data ?? undefined) as Prisma.InputJsonValue | undefined,
    })),
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
