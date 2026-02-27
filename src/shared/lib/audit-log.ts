import { prisma } from "./prisma";

interface AuditLogInput {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export function logAudit(input: AuditLogInput): void {
  prisma.auditLog
    .create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        oldData: input.oldData ? JSON.parse(JSON.stringify(input.oldData)) : null,
        newData: input.newData ? JSON.parse(JSON.stringify(input.newData)) : null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    })
    .catch(() => {});
}
