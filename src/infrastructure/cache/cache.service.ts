import { getRedis } from "./redis.client";

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedis();
    if (!redis) return null;
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn("[Cache] GET failed for key:", key, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.warn("[Cache] SET failed for key:", key, err instanceof Error ? err.message : err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    await redis.del(key);
  } catch (err) {
    console.warn("[Cache] DEL failed for key:", key, err instanceof Error ? err.message : err);
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
  } catch (err) {
    console.warn("[Cache] DEL pattern failed:", pattern, err instanceof Error ? err.message : err);
  }
}
