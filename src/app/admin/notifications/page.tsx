import type { Metadata } from "next";
import { Bell, MailOpen, BarChart3 } from "lucide-react";
import { prisma } from "@/shared/lib/prisma";
import { BroadcastDialog } from "./broadcast-dialog";
import { NotificationsLog } from "./notifications-log";
import type { NotificationType } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifikasi — Admin",
};

const ITEMS_PER_PAGE = 30;

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const typeLabels: Record<NotificationType, string> = {
  SYSTEM: "System",
  PAYMENT_SUCCESS: "Payment Success",
  SCORE_UPDATE: "Score Update",
  PACKAGE_NEW: "Paket Baru",
  STUDY_REMINDER: "Study Reminder",
  EXAM_DEADLINE: "Exam Deadline",
  QUESTION_STATUS: "Status Soal",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    q?: string;
  }>;
}

export default async function AdminNotificationsPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const typeParam = params.type ?? "";
  const q = params.q?.trim() ?? "";

  const typeFilter = typeParam as NotificationType | "";

  const whereBase = typeFilter ? { type: typeFilter } : {};
  const whereSearch =
    q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {};

  const where = { ...whereBase, ...whereSearch };

  const [
    totalCount,
    unreadCount,
    typeBreakdown,
    notifications,
    filteredTotal,
  ] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.groupBy({
      by: ["type"],
      _count: { _all: true },
      orderBy: { _count: { type: "desc" } },
    }),
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

  const topType = typeBreakdown[0];
  const topTypeLabel = topType
    ? `${typeLabels[topType.type] ?? topType.type} (${topType._count._all.toLocaleString("id-ID")})`
    : "—";

  const totalPages = Math.ceil(filteredTotal / ITEMS_PER_PAGE);

  const serializedNotifications = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Notifikasi</h2>
            <p className="text-sm text-muted-foreground">
              Kelola dan broadcast notifikasi ke pengguna
            </p>
          </div>
        </div>
        <BroadcastDialog />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={cardCls}>
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Notifikasi</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums">
                {totalCount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <MailOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Belum Dibaca</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums">
                {unreadCount.toLocaleString("id-ID")}
              </p>
              {totalCount > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {Math.round((unreadCount / totalCount) * 100)}% dari total
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <BarChart3 className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Jenis Terbanyak</p>
              <p className="mt-0.5 text-sm font-semibold">{topTypeLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Log */}
      <NotificationsLog
        notifications={serializedNotifications}
        total={filteredTotal}
        page={page}
        totalPages={totalPages}
        currentType={typeFilter}
        currentQ={q}
      />
    </div>
  );
}
