import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DATABASE_POOL_SIZE ?? "10", 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function gracefulShutdown(): void {
  globalForPrisma.pgPool?.end().catch(() => {});
  prisma.$disconnect().catch(() => {});
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
