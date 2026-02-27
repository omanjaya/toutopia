import { getRedis } from "@/infrastructure/cache/redis.client";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// Fallback in-memory store for when Redis is unavailable
const memoryMap = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup of expired entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of memoryMap) {
    if (entry.resetAt < now) {
      memoryMap.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();
  const now = Date.now();
  const entry = memoryMap.get(key);

  if (!entry || entry.resetAt < now) {
    memoryMap.set(key, { count: 1, resetAt: now + config.windowMs });
    redisIncrement(key, config).catch(() => {});
    return { success: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  redisIncrement(key, config).catch(() => {});
  return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

async function redisIncrement(key: string, config: RateLimitConfig): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    const redisKey = `rl:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, config.windowMs);
    }
    const ttl = await redis.pttl(redisKey);
    memoryMap.set(key, {
      count,
      resetAt: Date.now() + (ttl > 0 ? ttl : config.windowMs),
    });
  } catch {
    // Redis unavailable — rely on in-memory fallback
  }
}

export async function checkRateLimitAsync(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const redis = await getRedis();
    if (!redis) return checkRateLimit(key, config);
    const redisKey = `rl:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, config.windowMs);
    }
    const ttl = await redis.pttl(redisKey);
    const resetAt = Date.now() + (ttl > 0 ? ttl : config.windowMs);

    return {
      success: count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt,
    };
  } catch {
    return checkRateLimit(key, config);
  }
}

// Pre-configured rate limiters
export const rateLimits = {
  api: { maxRequests: 60, windowMs: 60_000 },       // 60/min
  auth: { maxRequests: 10, windowMs: 60_000 },       // 10/min
  payment: { maxRequests: 5, windowMs: 60_000 },     // 5/min
  upload: { maxRequests: 10, windowMs: 60_000 },      // 10/min
  login: { maxRequests: 5, windowMs: 300_000 },       // 5/5min
} as const;
