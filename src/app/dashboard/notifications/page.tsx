import type { Metadata } from "next";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Trophy,
  Award,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { MarkAllReadButton } from "./mark-all-read";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { NotificationType } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifikasi",
  description: "Semua notifikasi untuk akunmu",
};

type NotificationData = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data: { actionUrl?: string } | null;
};

function getNotificationIcon(type: NotificationType): React.JSX.Element {
  switch (type) {
    case "SCORE_UPDATE":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "PAYMENT_SUCCESS":
      return <CreditCard className="h-5 w-5 text-green-500" />;
    case "PACKAGE_NEW":
      return <Award className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
}

function groupNotificationsByDate(
  notifications: NotificationData[]
): Map<string, NotificationData[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups = new Map<string, NotificationData[]>([
    ["Hari ini", []],
    ["Kemarin", []],
    ["Minggu lalu", []],
    ["Lebih lama", []],
  ]);

  for (const notification of notifications) {
    const created = new Date(notification.createdAt);
    const createdDay = new Date(
      created.getFullYear(),
      created.getMonth(),
      created.getDate()
    );

    if (createdDay.getTime() === today.getTime()) {
      groups.get("Hari ini")!.push(notification);
    } else if (createdDay.getTime() === yesterday.getTime()) {
      groups.get("Kemarin")!.push(notification);
    } else if (createdDay >= lastWeek) {
      groups.get("Minggu lalu")!.push(notification);
    } else {
      groups.get("Lebih lama")!.push(notification);
    }
  }

  return groups;
}

function NotificationRow({
  notification,
}: {
  notification: NotificationData;
}): React.JSX.Element {
  const actionUrl =
    notification.data && typeof notification.data === "object"
      ? (notification.data as { actionUrl?: string }).actionUrl
      : undefined;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 border-b px-4 py-4 transition-colors hover:bg-muted/50",
        !notification.isRead &&
          "border-l-2 border-l-primary bg-primary/[0.03]"
      )}
    >
      <div className="mt-0.5 shrink-0">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm",
            !notification.isRead ? "font-semibold" : "font-medium"
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: localeId,
          })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );

  if (actionUrl) {
    return <Link href={actionUrl}>{content}</Link>;
  }

  return content;
}

export default async function NotificationsPage(): Promise<React.JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
      data: true,
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typedNotifications: NotificationData[] = notifications.map((n) => ({
    ...n,
    data:
      n.data !== null && typeof n.data === "object" && !Array.isArray(n.data)
        ? (n.data as { actionUrl?: string })
        : null,
  }));

  const groups = groupNotificationsByDate(typedNotifications);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Notifikasi</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <Bell className="h-12 w-12 opacity-30" />
          <p className="text-sm">Tidak ada notifikasi</p>
        </div>
      )}

      {/* Grouped notifications */}
      {notifications.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          {Array.from(groups.entries()).map(([label, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={label}>
                <div className="bg-muted/50 px-4 py-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
                {items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
