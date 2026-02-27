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
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log",
};

const ITEMS_PER_PAGE = 30;

const actionBadgeClass: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
  REVIEW: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
};

interface Props {
  searchParams: Promise<{
    entity?: string;
    userId?: string;
    page?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const entityFilter = params.entity ?? "";
  const userIdFilter = params.userId ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Prisma.AuditLogWhereInput = {};
  if (entityFilter) where.entity = entityFilter;
  if (userIdFilter) where.userId = userIdFilter;

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
    if (overrides.entity ?? entityFilter) p.set("entity", overrides.entity ?? entityFilter);
    if (overrides.userId ?? userIdFilter) p.set("userId", overrides.userId ?? userIdFilter);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/audit-logs?${p.toString()}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <p className="text-muted-foreground">
          {total.toLocaleString("id-ID")} aktivitas tercatat
        </p>
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
                  <Badge variant="outline" className={actionBadgeClass[log.action] ?? ""}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{log.entity}</TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {log.entityId ? log.entityId.substring(0, 8) + "..." : "-"}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} log)
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
