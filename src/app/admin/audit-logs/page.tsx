import type { Metadata } from "next";
import { prisma } from "@/shared/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Search,
  CalendarRange,
  Activity,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { CopyableId } from "./copyable-id";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log",
};

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

const ITEMS_PER_PAGE = 30;

const actionBadgeClass: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-500/10 text-blue-700 border-blue-200",
  DELETE: "bg-red-500/10 text-red-700 border-red-200",
  REVIEW: "bg-purple-500/10 text-purple-700 border-purple-200",
  APPROVE: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  REJECT: "bg-red-500/10 text-red-700 border-red-200",
  TEACHER_ASSIGN: "bg-purple-500/10 text-purple-700 border-purple-200",
  TEACHER_REMOVE: "bg-purple-500/10 text-purple-700 border-purple-200",
};

function getActionBadgeClass(action: string): string {
  if (action in actionBadgeClass) return actionBadgeClass[action];
  if (action.startsWith("PAYOUT_")) return "bg-amber-500/10 text-amber-700 border-amber-200";
  if (action.startsWith("TEACHER_")) return "bg-purple-500/10 text-purple-700 border-purple-200";
  return "";
}

interface Props {
  searchParams: Promise<{
    entity?: string;
    entityId?: string;
    userFilter?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const entityFilter = params.entity ?? "";
  const entityId = params.entityId ?? "";
  const userFilter = params.userFilter ?? "";
  const from = params.from ?? "";
  const to = params.to ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Prisma.AuditLogWhereInput = {};
  if (entityFilter) where.entity = entityFilter;
  if (entityId) where.entityId = { contains: entityId, mode: "insensitive" };
  if (userFilter) {
    where.user = {
      OR: [
        { name: { contains: userFilter, mode: "insensitive" } },
        { email: { contains: userFilter, mode: "insensitive" } },
      ],
    };
  }
  if (from || to) {
    where.createdAt = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to + "T23:59:59") }),
    };
  }

  // Start of today in WIB (UTC+7)
  const nowUtc = new Date();
  const startOfToday = new Date(
    Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), -7)
  );

  const [logs, total, entities, todayCount, uniqueUsersCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["entity"],
      select: { entity: true },
      orderBy: { entity: "asc" },
    }),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.auditLog.groupBy({ by: ["userId"], _count: true }).then((r) => r.length),
  ]);

  const totalAll = await prisma.auditLog.count();
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    const resolved = {
      entity: overrides.entity ?? entityFilter,
      entityId: overrides.entityId ?? entityId,
      userFilter: overrides.userFilter ?? userFilter,
      from: overrides.from ?? from,
      to: overrides.to ?? to,
      page: overrides.page ?? "",
    };
    if (resolved.entity) p.set("entity", resolved.entity);
    if (resolved.entityId) p.set("entityId", resolved.entityId);
    if (resolved.userFilter) p.set("userFilter", resolved.userFilter);
    if (resolved.from) p.set("from", resolved.from);
    if (resolved.to) p.set("to", resolved.to);
    if (resolved.page) p.set("page", resolved.page);
    return `/admin/audit-logs?${p.toString()}`;
  }

  const hasFilter = !!(entityFilter || entityId || userFilter || from || to);

  const statCards = [
    { title: "Total Aktivitas", value: totalAll, icon: ScrollText, color: "bg-blue-500/10 text-blue-600" },
    { title: "Hari Ini", value: todayCount, icon: Activity, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Jenis Entity", value: entities.length, icon: ScrollText, color: "bg-violet-500/10 text-violet-600" },
    { title: "Total User Aktif", value: uniqueUsersCount, icon: Activity, color: "bg-teal-500/10 text-teal-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Audit Log</h2>
          <p className="text-sm text-muted-foreground">
            {totalAll.toLocaleString("id-ID")} aktivitas tercatat
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={cardCls}>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {stat.value.toLocaleString("id-ID")}
                </p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className={`${cardCls} p-4`}>
        <div className="space-y-3">
          {/* Entity type pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Entity:</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href={buildUrl({ entity: "", page: "1" })}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  entityFilter === ""
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Semua
              </Link>
              {entities.map((e) => (
                <Link
                  key={e.entity}
                  href={buildUrl({ entity: e.entity, page: "1" })}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    entityFilter === e.entity
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {e.entity}
                </Link>
              ))}
            </div>
          </div>

          {/* Search & date filters */}
          <form method="GET" action="/admin/audit-logs" className="flex flex-wrap items-center gap-3">
            {entityFilter && <input type="hidden" name="entity" value={entityFilter} />}

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="entityId"
                  defaultValue={entityId}
                  placeholder="Cari Entity ID..."
                  className="h-9 w-44 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="userFilter"
                  defaultValue={userFilter}
                  placeholder="Cari nama / email user..."
                  className="h-9 w-52 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">–</span>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>

            <Button type="submit" size="sm">Terapkan</Button>

            {hasFilter && (
              <Button type="button" size="sm" variant="ghost" className="text-xs text-muted-foreground" asChild>
                <Link href="/admin/audit-logs">Reset</Link>
              </Button>
            )}
          </form>

          {hasFilter && (
            <p className="border-t border-border/40 pt-3 text-xs text-muted-foreground">
              Menampilkan{" "}
              <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> hasil
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Waktu</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead className="pr-5">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/40">
                <TableCell className="pl-5 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                  {format(log.createdAt, "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                </TableCell>
                <TableCell className="text-sm">
                  {log.user ? (
                    <div>
                      <p className="font-medium">{log.user.name}</p>
                      <p className="text-xs text-muted-foreground">{log.user.email}</p>
                    </div>
                  ) : (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      System
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">{log.entity}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.entityId ? <CopyableId id={log.entityId} /> : "—"}
                </TableCell>
                <TableCell className="pr-5 text-xs tabular-nums text-muted-foreground">
                  {log.ipAddress ?? "—"}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <ScrollText className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {hasFilter ? "Tidak ada log yang sesuai filter" : "Belum ada aktivitas tercatat"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span> log
          </p>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya
              </Button>
            )}
            <span className="min-w-[60px] text-center text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Selanjutnya<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
