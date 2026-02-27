import { getRedis } from "./redis.client";

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedis();
    if (!redis) return null;
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Silently fail — cache is not critical
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    await redis.del(key);
  } catch {
    // Silently fail
  }
}

async function scanKeys(pattern: string): Promise<string[]> {
  const redis = await getRedis();
  if (!redis) return [];
  const keys: string[] = [];
  let cursor = "0";
  do {
    const [nextCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    keys.push(...foundKeys);
  } while (cursor !== "0");
  return keys;
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await scanKeys(pattern);
    if (keys.length > 0) {
      const redis = await getRedis();
      if (!redis) return;
      await redis.del(...keys);
    }
  } catch {
    // Silently fail
  }
}
