import "server-only";
import { getRedis } from "@/lib/redis";

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  const cached = await redis.get(key);

  if (!cached) {
    return null;
  }

  return JSON.parse(cached) as T;
}

export async function setCachedJson(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const redis = await getRedis();

  await redis.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
}