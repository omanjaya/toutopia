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
  Download,
  ScrollText,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { CopyableId } from "./copyable-id";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log",
};

const ITEMS_PER_PAGE = 30;

const actionBadgeClass: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
  REVIEW: "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400",
  APPROVE: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  REJECT: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
  TEACHER_ASSIGN: "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400",
  TEACHER_REMOVE: "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400",
};

function getActionBadgeClass(action: string): string {
  if (action in actionBadgeClass) return actionBadgeClass[action];
  if (action.startsWith("PAYOUT_")) {
    return "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400";
  }
  if (action.startsWith("TEACHER_")) {
    return "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400";
  }
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
  if (entityId) {
    where.entityId = { contains: entityId, mode: "insensitive" };
  }
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

  const [logs, total, entities] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["entity"],
      select: { entity: true },
      orderBy: { entity: "asc" },
    }),
  ]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground">
            {total.toLocaleString("id-ID")} aktivitas tercatat
          </p>
        </div>
        <button
          disabled
          title="Segera hadir"
          className="flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed text-sm text-muted-foreground cursor-not-allowed opacity-60"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Entity filter pills */}
      <div className="flex flex-wrap gap-1 rounded-lg border p-1 w-fit">
        <Link
          href={buildUrl({ entity: "", page: "1" })}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            entityFilter === ""
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Semua
        </Link>
        {entities.map((e) => (
          <Link
            key={e.entity}
            href={buildUrl({ entity: e.entity, page: "1" })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              entityFilter === e.entity
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {e.entity}
          </Link>
        ))}
      </div>

      {/* Search & filter bar */}
      <form method="GET" action="/admin/audit-logs" className="flex flex-wrap gap-3 items-center">
        {/* Preserve entity filter when submitting form */}
        {entityFilter && <input type="hidden" name="entity" value={entityFilter} />}

        <input
          name="entityId"
          defaultValue={entityId}
          placeholder="Cari Entity ID..."
          className="h-9 w-48 rounded-lg border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <input
          name="userFilter"
          defaultValue={userFilter}
          placeholder="Cari nama / email user..."
          className="h-9 w-56 rounded-lg border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Dari</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Sampai</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button type="submit" size="sm" variant="secondary">
          Terapkan
        </Button>

        {(entityId || userFilter || from || to) && (
          <Button type="button" size="sm" variant="ghost" asChild>
            <Link href={buildUrl({ entityId: "", userFilter: "", from: "", to: "", page: "1" })}>
              Reset
            </Link>
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
                  {format(log.createdAt, "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                </TableCell>
                <TableCell className="text-sm">
                  {log.user ? (
                    <div>
                      <p className="font-medium">{log.user.name}</p>
                      <p className="text-xs text-muted-foreground">{log.user.email}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">System</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getActionBadgeClass(log.action)}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{log.entity}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.entityId ? <CopyableId id={log.entityId} /> : "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {log.ipAddress ?? "-"}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ScrollText className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Belum ada aktivitas tercatat
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
            Halaman {page} dari {totalPages} ({total.toLocaleString("id-ID")} log)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page - 1) })}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Sebelumnya
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildUrl({ page: String(page + 1) })}>
                  Selanjutnya
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
