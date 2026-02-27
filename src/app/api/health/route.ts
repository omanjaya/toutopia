import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getRedis } from "@/infrastructure/cache/redis.client";
import { auth } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  // Unauthenticated or non-admin: return simple status only
  if (!isAdmin) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return NextResponse.json({ status: "ok" });
    } catch {
      return NextResponse.json({ status: "error" }, { status: 503 });
    }
  }

  // Admin: return detailed health checks
  const checks: Record<string, string> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Redis check
  try {
    const redis = await getRedis();
    if (redis) {
      await redis.ping();
      checks.redis = "ok";
    } else {
      checks.redis = "unavailable";
    }
  } catch {
    checks.redis = "error";
  }

  // MinIO check
  try {
    const { Client } = await import("minio");
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
      port: parseInt(process.env.MINIO_PORT ?? "9000", 10),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY ?? "",
      secretKey: process.env.MINIO_SECRET_KEY ?? "",
    });
    const bucket = process.env.MINIO_BUCKET ?? "uploads";
    await minioClient.bucketExists(bucket);
    checks.minio = "ok";
  } catch {
    checks.minio = "error";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
