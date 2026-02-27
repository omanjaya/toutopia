import type Redis from "ioredis";

let _redis: Redis | null = null;
let _initPromise: Promise<Redis | null> | null = null;

async function initRedis(): Promise<Redis | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    const { default: IORedis } = await import("ioredis");
    const client = new IORedis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    await client.connect();
    return client;
  } catch {
    return null;
  }
}

export async function getRedis(): Promise<Redis | null> {
  if (_redis) return _redis;
  if (!_initPromise) {
    _initPromise = initRedis().then((r) => {
      _redis = r;
      return r;
    });
  }
  return _initPromise;
}
